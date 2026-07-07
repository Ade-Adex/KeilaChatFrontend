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
  setOperatorTyping: (typing: boolean) => void
  setSocketOperatorName: (name: string | undefined) => void
  setSocketOperatorAvatar: (avatar: string | undefined) => void

  // Cryptographic Key Handshaking Actions
  initiateE2EEHandshake: () => Promise<void>
  handleIncomingPublicKey: (receivedPublicJwk: JsonWebKey) => Promise<void>
  decryptIncomingMessage: (message: ChatMessage) => Promise<ChatMessage>
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

      // Decrypt any back-buffered messages now that keys match
      const { messages } = get()
      const decryptedList = await Promise.all(
        messages.map(async (msg) => {
          if (
            msg.iv &&
            msg.messageText &&
            !msg.messageText.startsWith('🚫') &&
            !msg.messageText.startsWith('⚠️')
          ) {
            const dec = await ChatEncryptionEngine.decryptMessage(
              msg.messageText,
              msg.iv,
            )
            return { ...msg, messageText: dec }
          }
          return msg
        }),
      )
      set({ messages: decryptedList })
    } catch (err) {
      console.error('[E2EE] Secret derivation breakdown:', err)
    }
  },

  decryptIncomingMessage: async (message) => {
    if (message.iv && message.messageText) {
      const decryptedText = await ChatEncryptionEngine.decryptMessage(
        message.messageText,
        message.iv,
      )
      return { ...message, messageText: decryptedText }
    }
    return message
  },
}))
