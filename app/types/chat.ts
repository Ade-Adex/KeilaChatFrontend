// /app//types/chat.ts

export interface MessagePayload {
  _id?: string
  sessionId: string
  senderType: 'visitor' | 'operator' | 'system'
  senderId: string
  propertyId: string
  senderName?: string
  messageText: string
  createdAt: string
}

export interface ConfigData {
  propertyId: string
  sessionId: string
  visitorId: string
}

export interface MessagesSyncResponse {
  status: string
  data: {
    messages: MessagePayload[]
  }
}

export interface SocketAck {
  error?: string
  status?: string
}

export interface TypingPayload {
  sessionId: string
  senderName: string
  isTyping: boolean
}