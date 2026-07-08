// /app/store/useVisitorChatStore.ts

import { ChatMessage, SafeSessionConfig } from '@/app/types/chat'
import { create } from 'zustand'

interface ChatState {
  session: SafeSessionConfig | null
  messages: ChatMessage[]
  operatorTyping: boolean

  // Setters & Actions
  setSession: (session: SafeSessionConfig | null) => void
  setOperatorTyping: (typing: boolean) => void
  setMessages: (messages: ChatMessage[]) => void
  addMessage: (message: ChatMessage) => void
  clearChat: () => void
}

export const useVisitorChatStore = create<ChatState>((set) => ({
  session: null,
  messages: [],
  operatorTyping: false,

  setSession: (session) => set({ session }),
  setOperatorTyping: (operatorTyping) => set({ operatorTyping }),
  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearChat: () =>
    set({
      session: null,
      messages: [],
      operatorTyping: false,
    }),
}))
