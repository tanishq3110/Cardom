import QRCode from 'qrcode'

/**
 * Builds a standard NPCI UPI URI for payments.
 * Format: upi://pay?pa=<upi_id>&pn=<payee_name>&am=<amount>&cu=INR&tn=<note>
 *
 * @param {Object} params
 * @param {string} params.upiId - Partner/Driver VPA / UPI ID
 * @param {string} [params.payeeName] - Partner / Driver display name
 * @param {number|string} params.amount - Payable amount in INR
 * @param {string} [params.note] - Transaction description / note
 * @returns {string} Standard UPI URI string
 */
export function buildUpiUri({ upiId, payeeName = 'Cardom Driver', amount, note = 'Cardom Ride Payment' }) {
  if (!upiId) return ''

  const cleanUpiId = String(upiId).trim()
  const cleanPayee = String(payeeName || 'Cardom Driver').trim()
  const formattedAmount = Number(amount || 0).toFixed(2)
  const cleanNote = String(note || 'Cardom Ride Payment').trim()

  const params = new URLSearchParams()
  params.set('pa', cleanUpiId)
  params.set('pn', cleanPayee)
  params.set('am', formattedAmount)
  params.set('cu', 'INR')
  params.set('tn', cleanNote)

  return `upi://pay?${params.toString()}`
}

/**
 * Generates a base64 Data URL QR code from text or UPI URI.
 *
 * @param {string} text - The UPI URI or text to encode
 * @param {Object} [options] - Optional qrcode configuration options
 * @returns {Promise<string>} Base64 image data URL
 */
export async function generateQrDataUrl(text, options = {}) {
  if (!text) return ''

  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    scale: 8,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  }

  try {
    return await QRCode.toDataURL(text, defaultOptions)
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err)
    return ''
  }
}

