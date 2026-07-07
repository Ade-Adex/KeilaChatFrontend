// /app/store/useVisitorChatStore.ts

import { create } from 'zustand'
import { getChatSocket } from '@/app/hooks/useChatSocket'
import { ChatEncryptionEngine } from '@/app/lib/utils/crypto'
import type { ChatMessage, SafeSessionConfig } from '@/app/types/chat'

// Explicitly extending ChatMessage locally to match your database payload schema for E2EE properties
interface E2EEChatMessage extends ChatMessage {
  isEncrypted?: boolean
  encryptionIv?: string
  media?: string[]
}

interface VisitorChatState {
  session: SafeSessionConfig | null
  messages: E2EEChatMessage[]
  loading: boolean
  isHandshakeComplete: boolean
  operatorTyping: boolean

  // Core Orchestration Actions
  setSession: (session: SafeSessionConfig | null) => void
  setInitialMessages: (messages: ChatMessage[]) => Promise<void>
  appendLiveMessage: (message: ChatMessage) => Promise<void>
  sendMessage: (text: string, mediaUrls?: string[]) => Promise<void>
  setOperatorTypingStatus: (isTyping: boolean) => void

  // E2EE Cryptographic Handshaking Logic
  initiateE2EEHandshake: () => Promise<void>
  handleOperatorPublicKey: (receivedJwk: JsonWebKey) => Promise<void>
  resetSecurityEngine: () => void
}

export const useVisitorChatStore = create<VisitorChatState>((set, get) => {
  const socket = getChatSocket()

  // Dynamic public key packet synchronization pipeline
socket.on(
  'public_key_received',
  async (data: { publicKey: JsonWebKey; clientType: string }) => {
    if (data.clientType === 'operator') {
      await get().handleOperatorPublicKey(data.publicKey)
    }
  },
)

  return {
    session: null,
    messages: [],
    loading: false,
    isHandshakeComplete: false,
    operatorTyping: false,

    setSession: (session) => {
      set({ session })

      if (!session) {
        get().resetSecurityEngine()
        return
      }

      // Safeguard validation loop check to verify if we are dealing with a live human operator agent
      const isHumanActive =
        session.status === 'active' &&
        session.assignedOperatorId &&
        String(session.assignedOperatorId).toLowerCase() !== 'ai'

      if (isHumanActive && !get().isHandshakeComplete) {
        get().initiateE2EEHandshake()
      }
    },

    setInitialMessages: async (rawMessages) => {
      set({ loading: true })
      try {
        const hydrated = await Promise.all(
          rawMessages.map(async (msg: E2EEChatMessage) => {
            if (msg.isEncrypted && msg.encryptionIv) {
              const cleanText = await ChatEncryptionEngine.decryptMessage(
                msg.messageText || '',
                msg.encryptionIv,
              )
              return { ...msg, messageText: cleanText }
            }
            return msg
          }),
        )
        set({ messages: hydrated })
      } catch (err) {
        console.error('Failed processing history clusters safely:', err)
        set({ messages: rawMessages })
      } finally {
        set({ loading: false })
      }
    },

    appendLiveMessage: async (message: E2EEChatMessage) => {
      if (message.isEncrypted && message.encryptionIv) {
        const decryptedText = await ChatEncryptionEngine.decryptMessage(
          message.messageText || '',
          message.encryptionIv,
        )
        message.messageText = decryptedText
      }

      set((state) => {
        const filtered = state.messages.filter((m) => m._id !== message._id)
        return { messages: [...filtered, message] }
      })
    },

    initiateE2EEHandshake: async () => {
      const { session } = get()
      if (!session?.sessionId) return

      try {
        const localPublicKeyJwk = await ChatEncryptionEngine.generateKeyPair()
        socket.emit('share_public_key', {
          sessionId: session.sessionId,
          publicKey: localPublicKeyJwk,
          clientType: 'visitor',
        })
      } catch (err) {
        console.error('E2EE Handshake initialization failure:', err)
      }
    },

    handleOperatorPublicKey: async (receivedJwk) => {
      try {
        await ChatEncryptionEngine.deriveSharedSecret(receivedJwk)
        set({ isHandshakeComplete: true })

        // Attempt asynchronous background decryption sweep for placeholders that failed previous passes
        const updated = await Promise.all(
          get().messages.map(async (msg) => {
            if (
              msg.isEncrypted &&
              msg.encryptionIv &&
              msg.messageText?.startsWith('⚠️')
            ) {
              const recoveryText = await ChatEncryptionEngine.decryptMessage(
                msg.messageText,
                msg.encryptionIv,
              )
              return { ...msg, messageText: recoveryText }
            }
            return msg
          }),
        )
        set({ messages: updated })
      } catch (err) {
        console.error(
          'Failed deriving symmetric keys from Operator matrix packet:',
          err,
        )
      }
    },

    sendMessage: async (text, mediaUrls) => {
      const { session, isHandshakeComplete } = get()
      if (!session?.sessionId) return

      let ciphertextBody = text
      let ivString = ''
      let encryptFlag = false

      const isHumanActive =
        session.status === 'active' &&
        session.assignedOperatorId &&
        String(session.assignedOperatorId).toLowerCase() !== 'ai'

      if (isHumanActive && isHandshakeComplete) {
        const encryptedResult = await ChatEncryptionEngine.encryptMessage(text)
        ciphertextBody = encryptedResult.ciphertext
        ivString = encryptedResult.iv
        encryptFlag = true
      }

      const outboundPacket = {
        sessionId: session.sessionId,
        propertyId: session.propertyId,
        senderType: 'visitor' as const,
        senderId: session.visitorId || 'visitor',
        messageText: ciphertextBody,
        messageType: mediaUrls && mediaUrls.length > 0 ? 'media' : 'text',
        media: mediaUrls || [],
        isEncrypted: encryptFlag,
        encryptionIv: ivString,
      }

      // Map to types specification layout for optimistic UI distribution updates
      const optimisticMessage: E2EEChatMessage = {
        _id: `optimistic-${Date.now()}`,
        sessionId: outboundPacket.sessionId,
        propertyId: outboundPacket.propertyId,
        senderType: outboundPacket.senderType,
        senderId: outboundPacket.senderId,
        messageText: text, // Keep local readable text
        messageType: outboundPacket.messageType,
        media: outboundPacket.media,
        isEncrypted: outboundPacket.isEncrypted,
        encryptionIv: outboundPacket.encryptionIv,
        status: 'sent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      set((state) => ({ messages: [...state.messages, optimisticMessage] }))

      // Ship safe formatted packet directly down your active socket network path
      socket.emit('send_message', outboundPacket)
    },

    setOperatorTypingStatus: (isTyping) => set({ operatorTyping: isTyping }),

    resetSecurityEngine: () => {
      set({ isHandshakeComplete: false, messages: [], operatorTyping: false })
    },
  }
})
