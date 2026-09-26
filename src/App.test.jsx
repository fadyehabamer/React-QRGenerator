import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { generateQrDataUrl } from './qr'

function setup() {
  const user = userEvent.setup()
  render(<App />)
  return {
    user,
    input: screen.getByLabelText('Text or URL to encode'),
    button: screen.getByRole('button', { name: 'Generate' }),
  }
}

describe('App', () => {
  it('disables Generate until there is non-blank input', async () => {
    const { user, input, button } = setup()

    expect(button).toBeDisabled()

    await user.type(input, '   ')
    expect(button).toBeDisabled()

    await user.type(input, 'hi')
    expect(button).toBeEnabled()

    await user.clear(input)
    expect(button).toBeDisabled()
  })

  it('shows no QR code or download link before generating', () => {
    setup()
    expect(screen.queryByAltText('Generated QR code')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /download qr code/i })).not.toBeInTheDocument()
  })

  it('generates a QR code image when the form is submitted', async () => {
    const { user, input, button } = setup()

    await user.type(input, 'https://example.com')
    await user.click(button)

    const img = await screen.findByAltText('Generated QR code')
    expect(img.getAttribute('src')).toBe(await generateQrDataUrl('https://example.com'))
  })

  it('submits when Enter is pressed in the input', async () => {
    const { user, input } = setup()

    await user.type(input, 'hello{Enter}')

    expect(await screen.findByAltText('Generated QR code')).toHaveAttribute(
      'src',
      await generateQrDataUrl('hello'),
    )
  })

  it('encodes the trimmed text', async () => {
    const { user, input } = setup()

    await user.type(input, '   hello   {Enter}')

    const img = await screen.findByAltText('Generated QR code')
    expect(img.getAttribute('src')).toBe(await generateQrDataUrl('hello'))
    expect(img.getAttribute('src')).not.toBe(await generateQrDataUrl('   hello   '))
  })

  it('offers the generated image as a PNG download', async () => {
    const { user, input } = setup()

    await user.type(input, 'download me{Enter}')

    const img = await screen.findByAltText('Generated QR code')
    const link = screen.getByRole('link', { name: /download qr code/i })
    expect(link).toHaveAttribute('download', 'qrCode.png')
    expect(link).toHaveAttribute('href', img.getAttribute('src'))
    expect(link.getAttribute('href')).toMatch(/^data:image\/png;base64,/)
  })

  it('replaces the QR code when new text is generated', async () => {
    const { user, input } = setup()

    await user.type(input, 'first{Enter}')
    const first = (await screen.findByAltText('Generated QR code')).getAttribute('src')

    await user.clear(input)
    await user.type(input, 'second{Enter}')
    const expected = await generateQrDataUrl('second')

    await vi.waitFor(() => {
      expect(screen.getByAltText('Generated QR code')).toHaveAttribute('src', expected)
    })
    expect(expected).not.toBe(first)
    expect(screen.getAllByAltText('Generated QR code')).toHaveLength(1)
    expect(screen.getByRole('link', { name: /download qr code/i })).toHaveAttribute('href', expected)
  })

  it('alerts and shows nothing when the text is too long to encode', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { input, button } = setup()

    fireEvent.change(input, { target: { value: 'a'.repeat(8000) } })
    fireEvent.click(button)

    await vi.waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1))
    expect(String(alertSpy.mock.calls[0][0])).toMatch(/too big/i)
    expect(screen.queryByAltText('Generated QR code')).not.toBeInTheDocument()
  })

  it('keeps the previous QR code if a later generation fails', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { user, input, button } = setup()

    await user.type(input, 'ok{Enter}')
    const img = await screen.findByAltText('Generated QR code')
    const good = img.getAttribute('src')

    fireEvent.change(input, { target: { value: 'a'.repeat(8000) } })
    fireEvent.click(button)

    await vi.waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1))
    expect(screen.getByAltText('Generated QR code')).toHaveAttribute('src', good)
  })
})
