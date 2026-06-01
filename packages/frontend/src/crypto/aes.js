// AES-256-GCM Encryption/Decryption

export async function encryptMessage(message, key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Generate random IV (96 bits for GCM)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    data
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
    version: 1
  };
}

export async function decryptMessage(encryptedData, key) {
  const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(encryptedData.ciphertext), c => c.charCodeAt(0));

  const plaintext = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(plaintext);
}
