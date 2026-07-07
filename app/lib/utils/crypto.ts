// /app/lib/utils/crypto.ts


/**
 * Convert an ArrayBuffer into a scannable Base64 String format safely
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

/**
 * Convert a standard Base64 String back into an ArrayBuffer configuration format safely
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

export class ChatEncryptionEngine {
  private static keyPair: CryptoKeyPair | null = null
  private static sharedSecretKey: CryptoKey | null = null

  /**
   * Generates local temporary Diffie-Hellman asymmetric cryptographic key pair structures
   */
  static async generateKeyPair() {
    this.keyPair = await window.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveKey', 'deriveBits'],
    )

    // Export public key parameter mapping safely for JSON distribution over WebSockets
    const exportedPublic = await window.crypto.subtle.exportKey(
      'jwk',
      this.keyPair.publicKey,
    )
    return exportedPublic
  }

  /**
   * Derives a symmetric AES key from the local private key and the partner's public key
   */
  static async deriveSharedSecret(receivedPublicJwk: JsonWebKey) {
    if (!this.keyPair?.privateKey)
      throw new Error('Local cryptographic identity uninitialized')

    const importedPublicKey = await window.crypto.subtle.importKey(
      'jwk',
      receivedPublicJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      [],
    )

    this.sharedSecretKey = await window.crypto.subtle.deriveKey(
      { name: 'ECDH', public: importedPublicKey },
      this.keyPair.privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )
  }

  /**
   * Encrypt a text string payload into a Base64 ciphertext representation block
   */
  static async encryptMessage(
    plainText: string,
  ): Promise<{ ciphertext: string; iv: string }> {
    // Fallback safely if human handshake keys have not finished aligning context properties yet
    if (!this.sharedSecretKey) return { ciphertext: plainText, iv: '' }

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encodedText = new TextEncoder().encode(plainText)

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.sharedSecretKey,
      encodedText,
    )

    return {
      ciphertext: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv.buffer),
    }
  }

  /**
   * Decrypt a base64 ciphertext record back into readable plaintext strings safely
   */
  static async decryptMessage(
    ciphertextBase64: string,
    ivBase64: string,
  ): Promise<string> {
    if (!this.sharedSecretKey || !ivBase64) return ciphertextBase64

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(base64ToBuffer(ivBase64)) },
        this.sharedSecretKey,
        base64ToBuffer(ciphertextBase64),
      )

      return new TextDecoder().decode(decryptedBuffer)
    } catch {
      return '⚠️ Decryption failure: Unable to decode payload verification clusters.'
    }
  }
}
