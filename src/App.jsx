import { useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [qrcode, setQrcode] = useState('')

  const generateQR = () => {

    QRCode.toDataURL(url, (err, url) => {
      if (err) {
        alert(err)
      }
      setQrcode(url)
    })
  }
  return (
    <div className="App">
      <div className="background">
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
      <input type="text" placeholder="https://www.google.com"
        value={url}
        onChange={(e) => { setUrl(e.target.value) }}
      />
      <button onClick={generateQR}>Generate</button>
      {qrcode &&
        <>
          <img src={qrcode} alt="qrcode" />
          <a href={qrcode} download='qrCode.png'> Download QR Code</a>
        </>
      }
    </div>
  )
}

export default App
