// AES-256-GCM Encryption/Decryption helpers
// Note: Encryption/Decryption happens on client side
// Server only stores encrypted blobs

export function validateEncryptedMessage(encryptedMessage) {
  const required = ['ciphertext', 'iv', 'tag', 'version'];
  for (const field of required) {
    if (!encryptedMessage[field]) {
      throw new Error(`Missing field: ${field}`);
    }
  }
  return true;
}

export function validateIV(iv) {
  // IV must be 96 bits (12 bytes) for GCM
  const ivBuffer = Buffer.from(iv, 'base64');
  if (ivBuffer.length !== 12) {
    throw new Error('Invalid IV length: must be 12 bytes');
  }
  return true;
}
