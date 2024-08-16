const QRCode = require('qrcode');

const generateQRCode = async (data) => {
  try {
    const url = await QRCode.toDataURL(data);
    return url;
  } catch (err) {
    console.error(err);
  }
};

module.exports = generateQRCode;

 


