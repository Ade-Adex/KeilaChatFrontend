// /app/store/useOperatorChatStore.ts

import { create } from 'zustand'
import { SafeSessionConfig, ChatMessage } from '@/app/types/chat'

interface OperatorChatState {
  activeSessions: SafeSessionConfig[]
  selectedSessionId: string | null
  sessionMessages: Record<string, ChatMessage[]>

  // Actions
  setActiveSessions: (sessions: SafeSessionConfig[]) => void
  setSelectedSessionId: (id: string | null) => void
  processAndAddOperatorMessage: (sessionId: string, msg: ChatMessage) => void
  clearOperatorStore: () => void
}

export const useOperatorChatStore = create<OperatorChatState>((set, get) => ({
  activeSessions: [],
  selectedSessionId: null,
  sessionMessages: {},

  setActiveSessions: (activeSessions) => set({ activeSessions }),
  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),

  processAndAddOperatorMessage: (sessionId, msg) => {
    const sessionMessages = get().sessionMessages
    const currentSessionMsgs = sessionMessages[sessionId] || []
    set({
      sessionMessages: {
        ...sessionMessages,
        [sessionId]: [...currentSessionMsgs, msg],
      },
    })
  },

  clearOperatorStore: () =>
    set({
      activeSessions: [],
      selectedSessionId: null,
      sessionMessages: {},
    }),
}))
