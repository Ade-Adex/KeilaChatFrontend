// /app/store/useOperatorChatStore.ts


import { create } from 'zustand'
import type { ChatMessage } from '@/app/types/dashboard'
import { ChatEncryptionEngine } from '@/app/lib/utils/crypto'
import { getChatSocket } from '@/app/hooks/useChatSocket'

interface OperatorChatState {
  exchangedSessions: Record<string, boolean> // tracks completion: sessionId -> boolean

  initiateOperatorHandshake: (sessionId: string) => Promise<void>
  handleVisitorPublicKey: (
    sessionId: string,
    visitorJwk: JsonWebKey,
  ) => Promise<void>
  encryptOutboundText: (
    sessionId: string,
    text: string,
  ) => Promise<{ ciphertext: string; iv: string } | null>
  decryptInboundMessage: (
    sessionId: string,
    message: ChatMessage,
  ) => Promise<ChatMessage>
}

export const useOperatorChatStore = create<OperatorChatState>((set, get) => ({
  exchangedSessions: {},

  initiateOperatorHandshake: async (sessionId) => {
    try {
      const localOperatorJwk =
        await ChatEncryptionEngine.getOrGenerateOperatorKeyPair()
      const socket = getChatSocket()
      if (socket?.connected) {
        socket.emit('share_public_key', {
          sessionId,
          publicKey: localOperatorJwk,
          clientType: 'operator',
        })
      }
    } catch (err) {
      console.error('[E2EE Operator] Key generation handshake failure:', err)
    }
  },

  handleVisitorPublicKey: async (sessionId, visitorJwk) => {
    try {
      await ChatEncryptionEngine.deriveOperatorSessionSecret(
        sessionId,
        visitorJwk,
      )
      set((state) => ({
        exchangedSessions: { ...state.exchangedSessions, [sessionId]: true },
      }))
    } catch (err) {
      console.error('[E2EE Operator] Derivation exception across channel:', err)
    }
  },

  encryptOutboundText: async (sessionId, text) => {
    if (!ChatEncryptionEngine.isOperatorSessionReady(sessionId)) return null
    return await ChatEncryptionEngine.encryptOperatorMessage(sessionId, text)
  },

  decryptInboundMessage: async (sessionId, message) => {
    if (message.iv && message.messageText) {
      const clearText = await ChatEncryptionEngine.decryptOperatorMessage(
        sessionId,
        message.messageText,
        message.iv,
      )
      return { ...message, messageText: clearText }
    }
    return message
  },
}))
