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
  // 👥 Visitor State Fallbacks (Single Instance)
  private static keyPair: CryptoKeyPair | null = null
  private static sharedSecretKey: CryptoKey | null = null

  // 👔 Operator State Matrix (Multi-Session Map Storage)
  private static operatorKeyPair: CryptoKeyPair | null = null
  private static operatorSessionKeys: Map<string, CryptoKey> = new Map()

  // =========================================================================
  // VISITOR INSTANCE CONTEXT ENGINE (Unchanged for Backwards Compatibility)
  // =========================================================================
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

  // =========================================================================
  // OPERATOR MULTI-SESSION CONTEXT ENGINE (Isolated Scope Keys)
  // =========================================================================
  static async getOrGenerateOperatorKeyPair() {
    if (!this.operatorKeyPair) {
      this.operatorKeyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        false,
        ['deriveKey', 'deriveBits'],
      )
    }
    return await window.crypto.subtle.exportKey(
      'jwk',
      this.operatorKeyPair.publicKey,
    )
  }

  static async deriveOperatorSessionSecret(
    sessionId: string,
    visitorPublicJwk: JsonWebKey,
  ) {
    if (!this.operatorKeyPair?.privateKey)
      throw new Error('Operator identity uninitialized')

    const importedPublicKey = await window.crypto.subtle.importKey(
      'jwk',
      visitorPublicJwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      [],
    )

    const derivedKey = await window.crypto.subtle.deriveKey(
      { name: 'ECDH', public: importedPublicKey },
      this.operatorKeyPair.privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt'],
    )

    this.operatorSessionKeys.set(sessionId, derivedKey)
  }

  static isOperatorSessionReady(sessionId: string): boolean {
    return this.operatorSessionKeys.has(sessionId)
  }

  static async encryptOperatorMessage(
    sessionId: string,
    plainText: string,
  ): Promise<{ ciphertext: string; iv: string }> {
    const sessionKey = this.operatorSessionKeys.get(sessionId)
    if (!sessionKey) return { ciphertext: plainText, iv: '' } // Fallback safely to cleartext

    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    const encodedText = new TextEncoder().encode(plainText)
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      sessionKey,
      encodedText,
    )

    return {
      ciphertext: bufferToBase64(encryptedBuffer),
      iv: bufferToBase64(iv.buffer),
    }
  }

  static async decryptOperatorMessage(
    sessionId: string,
    ciphertextBase64: string,
    ivBase64: string,
  ): Promise<string> {
    const sessionKey = this.operatorSessionKeys.get(sessionId)
    if (!sessionKey || !ivBase64) return ciphertextBase64

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(base64ToBuffer(ivBase64)) },
        sessionKey,
        base64ToBuffer(ciphertextBase64),
      )
      return new TextDecoder().decode(decryptedBuffer)
    } catch {
      return '🔒 [E2EE Decryption Error - Key Missing or Stale]'
    }
  }

  // File pipeline helper helper remains constant...
  static async encryptFile(fileBlob: Blob) {
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
