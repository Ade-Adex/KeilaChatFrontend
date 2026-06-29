// /app/types/operators.ts

export interface OperatorData {
  _id: string
  accountId: string
  email: string
  role: 'admin' | 'supervisor' | 'agent'
  status: 'active' | 'invited' | 'suspended'
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}
