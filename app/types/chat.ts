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


export interface ChatSessionConfig {
  propertyId: string

  sessionId: string

  visitorId: string

  status: 'waiting' | 'queued' | 'active' | 'closed'
}

export interface WidgetTheme {
  primaryColor?: string
  secondaryColor?: string
  textColor?: string
  backgroundColor?: string
}

export interface WidgetConfig {
  _id: string
  name: string
  propertyId: string

  theme?: WidgetTheme

  settings?: {
    position?: 'left' | 'right'
    welcomeMessage?: string
    offlineMessage?: string
  }
}

export interface ChatWindowProps {
  widgetId: string

  visitorTrackingId: string

  widget: WidgetConfig

  onClose: () => void
}

export interface SessionConfig {
  sessionId: string
  propertyId: string
  visitorId: string
  status: 'queued' | 'active' | 'closed'
}

export type MessageSender = 'visitor' | 'operator' | 'system'

export interface ChatMessage {
  _id?: string

  sessionId: string

  senderType: MessageSender

  senderId: string

  senderName?: string

  messageText: string

  createdAt: string
}

export interface PresenceNotification {
  _id: string

  sessionId: string

  senderType: 'system'

  senderId: string

  messageText: string

  createdAt: string
}

export interface ChatWindowProps {
  widget: WidgetConfig

  widgetId: string

  visitorTrackingId: string

  onClose: () => void
}