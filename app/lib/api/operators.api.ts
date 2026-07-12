// // /app/lib/api/operators.api.ts

// import { apiGet, apiPost } from '@/app/lib/api/apiClient'

// export interface OperatorData {
//   _id: string
//   accountId: string
//   email: string
//   role: 'admin' | 'supervisor' | 'agent'
//   status: 'active' | 'invited' | 'suspended'
//   firstName?: string
//   lastName?: string
//   avatar?: string
//   isOnline: boolean
// }

// export interface OperatorsResponse {
//   status: string
//   data: OperatorData[]
// }

// export interface InviteOperatorRequest {
//   // accountId: string
//   email: string
//   role: 'admin' | 'supervisor' | 'agent'
// }

// export interface InviteOperatorResponse {
//   status: string
//   message: string
// }

// /* -------------------------------------------------------------------------- */
// /*                              ADMIN GET ALL OPERATORS                           */
// /* -------------------------------------------------------------------------- */

// export function getOperators() {
//   return apiGet<OperatorsResponse>('/api/v1/operators')
// }

// /* -------------------------------------------------------------------------- */
// /*                              ADMIN INVITE OPERATORS                           */
// /* -------------------------------------------------------------------------- */

// export function inviteOperator(data: InviteOperatorRequest) {
//   return apiPost<InviteOperatorResponse>('/api/v1/operators/invite', data)
// }

// /* -------------------------------------------------------------------------- */
// /*                             OPERATOR INVITE VERIFICATION                           */
// /* -------------------------------------------------------------------------- */

// export interface VerifyInviteResponse {
//   status: string

//   data: {
//     email: string
//     role: 'admin' | 'supervisor' | 'agent'
//   }
// }

// export function verifyInvite(token: string) {
//   return apiGet<VerifyInviteResponse>(
//     `/api/v1/operators/invite/verify?token=${token}`,
//   )
// }

// /* -------------------------------------------------------------------------- */
// /*                              OPERATOR ACCEPT INVITE                                */
// /* -------------------------------------------------------------------------- */

// export interface AcceptInviteRequest {
//   token: string

//   firstName: string
//   lastName: string

//   password: string
// }

// export interface AcceptInviteResponse {
//   status: string
//   message: string
// }

// export function acceptInvite(data: AcceptInviteRequest) {
//   return apiPost<AcceptInviteResponse>(
//     '/api/v1/operators/invite/accept',
//     data,
//   )
// }

import { apiGet, apiPost } from '@/app/lib/api/apiClient'

export interface OperatorData {
  _id: string
  accountId: string
  email: string
  role: 'admin' | 'supervisor' | 'agent'
  status: 'active' | 'invited' | 'suspended'
  firstName?: string
  lastName?: string
  avatar?: string
  assignedProperties?: string[]
  socketId?: string
  isOnline: boolean
  lastSeen?: string | Date
  isTyping?: boolean
  currentSessionId?: string
  stats?: {
    chatsHandled: number
    averageResponseTime: number
    satisfactionScore: number
  }
  lastTypingAt?: string | Date
  joinedAt?: string | Date
  availabilityStatus: 'online' | 'away' | 'busy' | 'offline'
  activeChatsCount: number
  maxConcurrentChats: number
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface OperatorsResponse {
  status: string
  data: OperatorData[]
}

export interface InviteOperatorRequest {
  email: string
  role: 'admin' | 'supervisor' | 'agent'
  assignedProperties: string[]
}

export interface InviteOperatorResponse {
  status: string
  message: string
}

/* -------------------------------------------------------------------------- */
/* ADMIN GET ALL OPERATORS                       */
/* -------------------------------------------------------------------------- */
export function getOperators() {
  return apiGet<OperatorsResponse>('/api/v1/operators')
}

/* -------------------------------------------------------------------------- */
/* ADMIN INVITE OPERATORS                        */
/* -------------------------------------------------------------------------- */
export function inviteOperator(data: InviteOperatorRequest) {
  return apiPost<InviteOperatorResponse>('/api/v1/operators/invite', data)
}

/* -------------------------------------------------------------------------- */
/* OPERATOR INVITE VERIFICATION                   */
/* -------------------------------------------------------------------------- */
export interface VerifyInviteResponse {
  status: string
  data: {
    email: string
    role: 'admin' | 'supervisor' | 'agent'
    assignedProperties: string[]
  }
}

export function verifyInvite(token: string) {
  return apiGet<VerifyInviteResponse>(
    `/api/v1/operators/invite/verify?token=${token}`,
  )
}

/* -------------------------------------------------------------------------- */
/* OPERATOR ACCEPT INVITE                        */
/* -------------------------------------------------------------------------- */
export interface AcceptInviteRequest {
  token: string
  firstName: string
  lastName: string
  password: string
}

export interface AcceptInviteResponse {
  status: string
  message: string
}

export function acceptInvite(data: AcceptInviteRequest) {
  return apiPost<AcceptInviteResponse>('/api/v1/operators/invite/accept', data)
}