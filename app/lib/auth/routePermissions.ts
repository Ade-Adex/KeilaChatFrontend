// /app/lib/auth/routePermissions.ts

import { Permissions } from "@/app/lib/auth/permissions"

export const RoutePermissions = {
  '/dashboard': {
    permission: Permissions.DASHBOARD,
    requiresProperty: false,
  },

  '/dashboard/inbox': {
    permission: Permissions.INBOX,
    requiresProperty: true,
  },

  '/dashboard/contacts': {
    permission: Permissions.CONTACTS,
    requiresProperty: true,
  },

  '/dashboard/knowledge-base': {
    permission: Permissions.KNOWLEDGEBASE,
    requiresProperty: true,
  },

  '/dashboard/settings': {
    permission: Permissions.SETTINGS,
    requiresProperty: false,
  },

  '/dashboard/setup': {
    permission: Permissions.SETUP,
    requiresProperty: false,
  },
} as const
