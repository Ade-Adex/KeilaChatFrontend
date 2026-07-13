// /app/lib/api/operators.api.ts


import { apiGet, apiPost } from '@/app/lib/api/apiClient'
import { OperatorData } from '@/app/types/operator'

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