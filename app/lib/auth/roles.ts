// /app/lib/auth/roles.ts

export const Roles = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  AGENT: 'agent',
} as const

export type UserRole = (typeof Roles)[keyof typeof Roles]

export function isAdmin(role?: string) {
  return role === Roles.ADMIN
}

export function isSupervisor(role?: string) {
  return role === Roles.SUPERVISOR
}

export function isAgent(role?: string) {
  return role === Roles.AGENT
}
