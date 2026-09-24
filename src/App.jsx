import { useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [qrcode, setQrcode] = useState('')

  const generateQR = (e) => {
    e.preventDefault()
    const text = url.trim()
    if (!text) {
      return
    }

    QRCode.toDataURL(text, (err, dataUrl) => {
      if (err) {
        alert(err)
        return
      }
      setQrcode(dataUrl)
    })
  }
  return (
    <div className="App">
      <div className="background" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <h1>
        QR Code Generator
      </h1>
      <form onSubmit={generateQR}>
        <label htmlFor="qr-text" className="visually-hidden">Text or URL to encode</label>
        <input id="qr-text" type="text" placeholder="https://www.google.com"
          value={url}
          onChange={(e) => { setUrl(e.target.value) }}
        />
        <button type="submit" disabled={!url.trim()}>Generate</button>
      </form>
      {qrcode &&
        <>
          <img src={qrcode} alt="Generated QR code" />
          <a href={qrcode} download='qrCode.png'> Download QR Code</a>
        </>
      }
    </div>
  )
}

export default App
