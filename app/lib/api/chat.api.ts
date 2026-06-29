// /app/lib/api/chat.api.ts

import { apiGet, apiPost, apiPatch } from '@/app/lib/api/apiClient'

import type {
  OperatorConversation,
  OperatorProfile,
  ChatMessage,
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

  messageType: 'text'

  isFromAI: false
}

export interface SendOperatorMessageResponse {
  status: string
  data: ChatMessage
}

export function sendOperatorMessage(payload: SendOperatorMessageRequest) {
  return apiPost<SendOperatorMessageResponse>('/api/v1/messages', payload)
}

export interface TypingRequest {
  actor: 'operator'
  typing: boolean
}

export function sendTypingStatus(sessionId: string, payload: TypingRequest) {
  return apiPatch(`/api/v1/chat/${sessionId}/typing`, payload)
}
