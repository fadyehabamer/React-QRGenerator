import { describe, expect, it } from 'vitest'
import {
  QR_DOWNLOAD_FILENAME,
  canGenerateQr,
  generateQrDataUrl,
  normalizeQrText,
} from './qr'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function decodeDataUrl(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  return { header, bytes: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)) }
}

describe('normalizeQrText', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeQrText('  https://example.com \n')).toBe('https://example.com')
  })

  it('keeps whitespace inside the text', () => {
    expect(normalizeQrText(' hello   world ')).toBe('hello   world')
  })

  it('treats null and undefined as empty', () => {
    expect(normalizeQrText(null)).toBe('')
    expect(normalizeQrText(undefined)).toBe('')
  })
})

describe('canGenerateQr', () => {
  it.each(['', ' ', '\t', '\n  \r\n'])('rejects blank input %j', (value) => {
    expect(canGenerateQr(value)).toBe(false)
  })

  it.each(['a', ' https://example.com ', '0'])('accepts non-blank input %j', (value) => {
    expect(canGenerateQr(value)).toBe(true)
  })
})

describe('generateQrDataUrl', () => {
  it('resolves with a PNG data URL', async () => {
    const dataUrl = await generateQrDataUrl('https://example.com')
    const { header, bytes } = decodeDataUrl(dataUrl)

    expect(header).toBe('data:image/png;base64')
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE)
  })

  it('is deterministic for the same text', async () => {
    const first = await generateQrDataUrl('same text')
    const second = await generateQrDataUrl('same text')
    expect(first).toBe(second)
  })

  it('produces different images for different text', async () => {
    const a = await generateQrDataUrl('first')
    const b = await generateQrDataUrl('second')
    expect(a).not.toBe(b)
  })

  it('rejects when the text is too long to fit in a QR code', async () => {
    await expect(generateQrDataUrl('a'.repeat(8000))).rejects.toThrow(/too big/i)
  })

  it('rejects empty text', async () => {
    await expect(generateQrDataUrl('')).rejects.toThrow()
  })
})

describe('QR_DOWNLOAD_FILENAME', () => {
  it('uses a .png extension matching the generated image type', () => {
    expect(QR_DOWNLOAD_FILENAME).toBe('qrCode.png')
  })
})
