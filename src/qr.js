import QRCode from 'qrcode'

/** File name used for the "Download QR Code" link. */
export const QR_DOWNLOAD_FILENAME = 'qrCode.png'

/** Text that will actually be encoded: surrounding whitespace is ignored. */
export function normalizeQrText(value) {
  return String(value ?? '').trim()
}

/** Whether the input contains anything worth encoding. */
export function canGenerateQr(value) {
  return normalizeQrText(value).length > 0
}

/**
 * Encodes `text` as a PNG data URL. Resolves with the data URL, or rejects
 * with the error reported by the `qrcode` package (e.g. input too long).
 */
export function generateQrDataUrl(text) {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(text, (err, dataUrl) => {
      if (err) {
        reject(err)
        return
      }
      resolve(dataUrl)
    })
  })
}
