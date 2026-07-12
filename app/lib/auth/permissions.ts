// /app/lib/auth/permissions.ts

import { Roles } from "@/app/lib/auth/roles"

export const Permissions = {
  DASHBOARD: 'dashboard:view',

  INBOX: 'inbox:view',

  CONTACTS: 'contacts:view',

  KNOWLEDGEBASE: 'knowledgebase:view',

  SETTINGS: 'settings:view',

  SETUP: 'setup:view',
} as const

export const RolePermissions: Record<string, string[]> = {
  [Roles.ADMIN]: [
    Permissions.DASHBOARD,

    Permissions.INBOX,

    Permissions.CONTACTS,

    Permissions.KNOWLEDGEBASE,

    Permissions.SETTINGS,

    Permissions.SETUP,
  ],

  [Roles.SUPERVISOR]: [Permissions.DASHBOARD, Permissions.INBOX],

  [Roles.AGENT]: [Permissions.DASHBOARD, Permissions.INBOX],
}

export function hasPermission(role: string | undefined, permission: string) {
  if (!role) return false

  return RolePermissions[role]?.includes(permission) ?? false
}
