import CryptoJS from 'crypto-js';

// Secret key - should match between admin and public pages
const SECRET_KEY = 'your-secret-key-2025-crm-system';

export const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    // Make URL safe
    return encodeURIComponent(encrypted);
  } catch (err) {
    console.error('Encryption error:', err);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    const decoded = decodeURIComponent(encryptedData);
    const decrypted = CryptoJS.AES.decrypt(decoded, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Decryption error:', err);
    return null;
  }
};
