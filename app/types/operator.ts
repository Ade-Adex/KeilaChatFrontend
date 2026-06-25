// /app/types/operators.ts

export interface OperatorData {
  id: string

  accountId: string

  firstName?: string

  lastName?: string

  email: string

  avatar: string

  role: 'admin' | 'supervisor' | 'agent'

  status: 'active' | 'invited' | 'suspended'

  createdAt: string

  updatedAt: string
}