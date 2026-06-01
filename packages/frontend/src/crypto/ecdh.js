// ECDH Key Exchange Implementation
// Uses Web Crypto API for secure key exchange

export async function generateKeyPair() {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    false, // not extractable
    ['deriveKey']
  );
}

export async function exportPublicKey(publicKey) {
  return await window.crypto.subtle.exportKey('jwk', publicKey);
}

export async function importPublicKey(publicKeyJwk) {
  return await window.crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    {
      name: 'ECDH',
      namedCurve: 'P-256'
    },
    false,
    []
  );
}

export async function deriveSharedSecret(privateKey, publicKey, pinCode) {
  // Derive shared secret from ECDH
  const sharedSecret = await window.crypto.subtle.deriveKey(
    {
      name: 'ECDH',
      public: publicKey
    },
    privateKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );

  return sharedSecret;
}
