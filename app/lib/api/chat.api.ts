// /app/lib/api/chat.api.ts

import { apiGet, apiPatch, apiPost, apiUpload } from '@/app/lib/api/apiClient'

import type { SessionInitResponse, WidgetConfig } from '@/app/types/chat'
import type {
  ChatMessage,
  OperatorConversation,
  OperatorProfile,
} from '@/app/types/dashboard'

/* -------------------------------------------------------------------------- */
/* ACCOUNT                                  */
/* -------------------------------------------------------------------------- */

export interface WorkspaceResponse {
  data: {
    account: {
      defaultProperty: string
    }
  }
}

export function getWorkspace() {
  return apiGet<WorkspaceResponse>('/api/v1/account/workspace')
}

/* -------------------------------------------------------------------------- */
/* PROPERTIES                                 */
/* -------------------------------------------------------------------------- */

export interface PropertyItem {
  _id: string
  accountId: string
  name: string
  domain: string
}

export interface PropertiesResponse {
  data: PropertyItem[]
}

export function getMyProperties() {
  return apiGet<PropertiesResponse>('/api/v1/properties')
}

/* -------------------------------------------------------------------------- */
/* WIDGETS                                                                    */
/* -------------------------------------------------------------------------- */

export interface VerifyWidgetResponse {
  status: string
  data: WidgetConfig
}

/**
 * Verifies a chat widget configuration via its specific unique identifier.
 */
export function verifyWidget(widgetId: string, headers?: Record<string, string>) {
  return apiGet<VerifyWidgetResponse>(`/api/v1/widget/${widgetId}/verify`, { headers })
}

/* -------------------------------------------------------------------------- */
/* SESSIONS                                  */
/* -------------------------------------------------------------------------- */

export interface SessionsResponse {
  data: OperatorConversation[]
}

export function getQueuedSessions(propertyId: string) {
  return apiGet<SessionsResponse>(
    `/api/v1/sessions/queued?propertyId=${propertyId}`,
  )
}

export function getActiveSessions(propertyId: string) {
  return apiGet<SessionsResponse>(
    `/api/v1/sessions/active?propertyId=${propertyId}`,
  )
}

export function getMySessions() {
  return apiGet<SessionsResponse>('/api/v1/operators/my-sessions')
}

/* -------------------------------------------------------------------------- */
/* PROFILE                                   */
/* -------------------------------------------------------------------------- */

export interface OperatorProfileResponse {
  data: OperatorProfile
}

export function getOperatorProfile() {
  return apiGet<OperatorProfileResponse>('/api/v1/operators/profile')
}

/* -------------------------------------------------------------------------- */
/* MESSAGES                                  */
/* -------------------------------------------------------------------------- */

export interface MessagesResponse {
  data: ChatMessage[]
}

export function getSessionMessages(sessionId: string) {
  return apiGet<MessagesResponse>(`/api/v1/messages/session/${sessionId}`)
}

export interface SendMessageResponse {
  data: ChatMessage
}

export interface SendOperatorMessageRequest {
  sessionId: string

  senderType: 'operator'

  senderId: string

  messageText: string

  messageType: 'text' | 'media' | 'image' | 'audio' | 'video' | 'file'

  isFromAI: false

  media?: string[]
}

export interface SendOperatorMessageResponse {
  status: string
  data: ChatMessage
}

export function sendOperatorMessage(payload: SendOperatorMessageRequest) {
  return apiPost<SendOperatorMessageResponse>('/api/v1/messages', payload)
}

export interface InitiateSessionRequest {
  widgetId: string
  visitorTrackingId: string
  createNew?: boolean
}

export function initiateSession(payload: InitiateSessionRequest) {
  return apiPost<SessionInitResponse>('/api/v1/sessions/initiate', payload)
}

export interface CloseSessionRequest {
  closedBy: 'visitor' | 'operator'
}

export function closeSession(
  sessionId: string,
  closedBy: CloseSessionRequest['closedBy'],
) {
  return apiPatch<{ status: string }>(`/api/v1/sessions/${sessionId}/close`, {
    closedBy,
  })
}

export interface MediaUploadResponse {
  status: string
  url: string
}

export function uploadMedia(formData: FormData) {
  return apiUpload<MediaUploadResponse>('/api/v1/media/upload', formData)
}

export interface UpdateVisitorProfileRequest {
  propertyId: string
  visitorTrackingId: string
  name: string
  email: string
}

export function updateVisitorProfile(payload: UpdateVisitorProfileRequest) {
  return apiPatch<{ status: string; success?: boolean }>(
    '/api/v1/visitors/profile',
    payload,
  )
}

export interface TypingRequest {
  actor: 'operator'
  typing: boolean
}

export function sendTypingStatus(sessionId: string, payload: TypingRequest) {
  return apiPatch(`/api/v1/chat/${sessionId}/typing`, payload)
}

/* -------------------------------------------------------------------------- */
/* TEAMMATES / OPERATORS                                                      */
/* -------------------------------------------------------------------------- */

export interface ActiveOperatorItem {
  _id: string
  firstName: string
  lastName?: string
  avatar?: string
  email: string
}

export interface ActiveOperatorsResponse {
  status: string
  data: ActiveOperatorItem[]
}

/**
 * Fetches all active/online operator agents available for chat transfers.
 */
export function getActiveOperators() {
  return apiGet<ActiveOperatorsResponse>('/api/v1/operators/active')
}

/* -------------------------------------------------------------------------- */
/* KNOWLEDGE BASE / AI CONTROL LAYER                                         */
/* -------------------------------------------------------------------------- */

export interface ToggleAIResponse {
  success: boolean
  message: string
  data: {
    sessionId: string
    aiEnabled: boolean
    status: string
  }
}

/**
 * Allows a human live agent to instantly override and pause/resume the AI bot
 * for a specific active chat window.
 */
export function toggleSessionAI(sessionId: string, aiEnabled: boolean) {
  return apiPatch<ToggleAIResponse>(`/api/v1/ai/session/${sessionId}/toggle`, {
    aiEnabled,
  })
}





/* -------------------------------------------------------------------------- */
/* PRESENCE HEARTBEAT                                                         */
/* -------------------------------------------------------------------------- */

export interface HeartbeatResponse {
  success: boolean
  message: string
}

/**
 * Dispatches a background heartbeat signal to update the operator's active cache lease.
 */
export function sendOperatorHeartbeat() {
  return apiPost<HeartbeatResponse>('/api/v1/operators/heartbeat', {})
}