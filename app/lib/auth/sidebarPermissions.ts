// /app/lib/auth/sidebarPermissions.ts


import { Permissions } from './permissions'

export const SidebarPermissions = {
  Overview: Permissions.DASHBOARD,

  Inbox: Permissions.INBOX,

  Contacts: Permissions.CONTACTS,

  'Knowledge Base': Permissions.KNOWLEDGEBASE,

  Setup: Permissions.SETUP,

  Settings: Permissions.SETTINGS,
} as const