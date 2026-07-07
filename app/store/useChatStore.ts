// /app/store/useChatStore.ts

import { create } from 'zustand'
import type { ChatMessage, SafeSessionConfig } from '@/app/types/chat'
import { ChatEncryptionEngine } from '@/app/lib/utils/crypto'
import { getChatSocket } from '@/app/hooks/useChatSocket'

interface ChatState {
  session: SafeSessionConfig | null
  messages: ChatMessage[]
  operatorTyping: boolean
  socketOperatorName: string | undefined
  socketOperatorAvatar: string | undefined
  publicKeyExchanged: boolean

  // Basic Mutations
  setSession: (
    session:
      | SafeSessionConfig
      | null
      | ((prev: SafeSessionConfig | null) => SafeSessionConfig | null),
  ) => void
  setInitialMessages: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]),
  ) => void
  addIncomingMessage: (message: ChatMessage) => Promise<void> // 🎯 Added clean pipeline
  setOperatorTyping: (typing: boolean) => void
  setSocketOperatorName: (name: string | undefined) => void
  setSocketOperatorAvatar: (avatar: string | undefined) => void

  // Cryptographic Key Handshaking Actions
  initiateE2EEHandshake: () => Promise<void>
  handleIncomingPublicKey: (receivedPublicJwk: JsonWebKey) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  session: null,
  messages: [],
  operatorTyping: false,
  socketOperatorName: undefined,
  socketOperatorAvatar: undefined,
  publicKeyExchanged: false,

  setSession: (updater) =>
    set((state) => ({
      session: typeof updater === 'function' ? updater(state.session) : updater,
    })),

  setInitialMessages: (updater) =>
    set((state) => ({
      messages:
        typeof updater === 'function' ? updater(state.messages) : updater,
    })),

  addIncomingMessage: async (message) => {
    const { messages } = get()
    // Skip duplicate entries
    if (
      messages.some(
        (m) =>
          m._id === message._id ||
          (m.createdAt === message.createdAt &&
            m.messageText === message.messageText),
      )
    )
      return

    const processedMsg = { ...message }

    if (message.iv && message.messageText && !message.isDecrypted) {
      try {
        const decryptedText = await ChatEncryptionEngine.decryptMessage(
          message.messageText,
          message.iv,
        )
        processedMsg.messageText = decryptedText
        processedMsg.isDecrypted = true
      } catch (err) {
        console.error('[E2EE] Live decryption failure:', err)
      }
    }

    set((state) => ({
      messages: [...state.messages, processedMsg],
    }))
  },

  setOperatorTyping: (typing) => set({ operatorTyping: typing }),
  setSocketOperatorName: (name) => set({ socketOperatorName: name }),
  setSocketOperatorAvatar: (avatar) => set({ socketOperatorAvatar: avatar }),

  initiateE2EEHandshake: async () => {
    const { session } = get()
    if (!session?.sessionId) return
    try {
      const localJwk = await ChatEncryptionEngine.generateKeyPair()
      const socket = getChatSocket()
      if (socket.connected) {
        socket.emit('share_public_key', {
          sessionId: session.sessionId,
          publicKey: localJwk,
          clientType: 'visitor',
        })
      }
    } catch (err) {
      console.error('[E2EE] Handshake generation failed:', err)
    }
  },

  handleIncomingPublicKey: async (receivedPublicJwk) => {
    try {
      await ChatEncryptionEngine.deriveSharedSecret(receivedPublicJwk)
      set({ publicKeyExchanged: true })

      const { messages } = get()
      const decryptedList = await Promise.all(
        messages.map(async (msg) => {
          if (
            msg.iv &&
            msg.messageText &&
            !msg.messageText.startsWith('🚫') &&
            !msg.messageText.startsWith('⚠️') &&
            !msg.isDecrypted
          ) {
            const dec = await ChatEncryptionEngine.decryptMessage(
              msg.messageText,
              msg.iv,
            )
            return { ...msg, messageText: dec, isDecrypted: true }
          }
          return msg
        }),
      )
      set({ messages: decryptedList })
    } catch (err) {
      console.error('[E2EE] Secret derivation breakdown:', err)
    }
  },
}))