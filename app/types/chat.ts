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

export interface WidgetSettingsConfig {
  launcherPosition: string
  launcherIcon?: string
  welcomeMessage: string
  offlineMessage: string
  showAgentPhoto: boolean
  soundEnabled: boolean
  allowFileUpload: boolean
  allowEmoji: boolean
  allowScreenshots: boolean
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
    onlineStatus?: boolean
    aiName?: string
  }
  widgetSettings?: WidgetSettingsConfig
}

export interface SessionConfig {
  sessionId: string
  propertyId: string
  visitorId: string
  assignedOperatorId?: string | null
  status: 'waiting' | 'queued' | 'active' | 'closed' | 'transferred'
}

export type MessageSender = 'visitor' | 'operator' | 'ai' | 'system'

export interface JoinChatPayload {
  sessionId: string
  propertyId: string
  visitorId?: string
  operatorId?: string
  clientType: 'visitor' | 'operator'
}

export interface JoinDashboardPayload {
  propertyId: string
  operatorId: string
}

export interface NotificationPayload {
  propertyId: string
}

export interface ChatMessage {
  _id?: string
  sessionId: string
  propertyId?: string
  senderType: MessageSender
  senderId: string
  senderName?: string
  senderAvatar?: string
  messageText: string
  messageType?: string
  status?: 'sent' | 'delivered' | 'seen' | 'failed'
  createdAt: string
  updatedAt?: string
  deliveredAt?: string
  seenAt?: string
}

export interface PresenceNotificationPayload {
  message: string
}

export interface MessageDeliveredPayload {
  messageId: string
  sessionId: string
}

export interface MessageErrorPayload {
  message: string
}

export interface IncomingVisitorAlert {
  sessionId: string
  messageText: string
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

export interface UserTypingPayload {
  sessionId: string
  senderName?: string
  isTyping: boolean
}

export interface SendMessagePayload {
  sessionId: string
  propertyId: string
  senderType: 'visitor'
  senderId: string
  messageText: string
}

/* -------------------------------------------------------------------------- */
/* 🎯 FIXED ORDERING: Interfaces defined before their compound utility shapes */
/* -------------------------------------------------------------------------- */

export interface PopulatedAccount {
  _id: string
  name: string
}

export interface PopulatedOperator {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  avatar?: string
  accountId?: PopulatedAccount
}

export interface SafeSessionConfig extends Omit<
  SessionConfig,
  'assignedOperatorId'
> {
  assignedOperatorId?: string | PopulatedOperator | null
}

export interface SessionInitResponse {
  status: string
  data: SafeSessionConfig
}
