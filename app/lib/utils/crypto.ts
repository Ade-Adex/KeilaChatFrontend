// /app/lib/utils/crypto.ts

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
}

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

  static async generateKeyPair() {
    this.keyPair = await window.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveKey', 'deriveBits'],
    )
    return await window.crypto.subtle.exportKey('jwk', this.keyPair.publicKey)
  }

  static async deriveSharedSecret(receivedPublicJwk: JsonWebKey) {
    if (!this.keyPair?.privateKey)
      throw new Error('Local identity uninitialized')

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

  static isReady(): boolean {
    return this.sharedSecretKey !== null
  }

  static async encryptMessage(
    plainText: string,
  ): Promise<{ ciphertext: string; iv: string }> {
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
      return '⚠️ Decryption failure: Unable to decode handshake metadata block.'
    }
  }

  /**
   * Encrypts file chunks client-side using a temporary symmetric key before cloud extraction
   */
  static async encryptFile(
    fileBlob: Blob,
  ): Promise<{
    encryptedBlob: Blob
    fileKeyJwk: JsonWebKey
    ivBase64: string
  }> {
    const fileKey = await window.crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const fileBytes = await fileBlob.arrayBuffer()

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      fileKey,
      fileBytes,
    )

    const exportedKey = await window.crypto.subtle.exportKey('jwk', fileKey)

    return {
      encryptedBlob: new Blob([encryptedBuffer], {
        type: 'application/octet-stream',
      }),
      fileKeyJwk: exportedKey,
      ivBase64: bufferToBase64(iv.buffer),
    }
  }
}
