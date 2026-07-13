// /app/types/operators.ts

import { AssignedProperty, OperatorAvailability, OperatorRole, OperatorStats, OperatorStatus } from "@/app/types/auth"

export interface OperatorData {
  _id: string

  accountId: string

  email: string

  role: OperatorRole

  status: OperatorStatus

  firstName?: string

  lastName?: string

  avatar?: string

  assignedProperties: AssignedProperty[]

  socketId?: string

  isOnline: boolean

  lastSeen?: string

  isTyping: boolean

  currentSessionId?: string

  lastTypingAt?: string

  joinedAt?: string

  availabilityStatus: OperatorAvailability

  activeChatsCount: number

  maxConcurrentChats: number

  permissions: string[]

  stats: OperatorStats

  createdAt: string

  updatedAt: string
}