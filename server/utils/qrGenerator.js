const QRCode = require('qrcode');

const generateUPIQRCode = async (upiId, name, amount) => {
  try {
    // UPI Deep Link Format
    // upi://pay?pa=UPIID&pn=NAME&am=AMOUNT&cu=INR
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
    
    // Generate QR as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(upiLink, { errorCorrectionLevel: 'H' });
    return qrCodeDataUrl;
  } catch (err) {
    console.error('QR Code Generation Error:', err);
    return null;
  }
};

module.exports = { generateUPIQRCode };
