
// /app/lib/auth/routePermissions.ts

import { Permissions } from '@/app/lib/auth/permissions'

export interface RoutePermission {
  permission: string

  /**
   * Whether this page depends on one or more Properties.
   * Example:
   * Inbox
   * Knowledge Base
   */
  requiresProperty: boolean

  /**
   * Whether only an Admin can create/manage properties here.
   */
  adminPropertySetup?: boolean
}

export const RoutePermissions: Record<string, RoutePermission> = {
  /**
   * Dashboard
   * Everyone can access.
   */
  '/dashboard': {
    permission: Permissions.DASHBOARD,
    requiresProperty: false,
  },

  /**
   * Inbox
   *
   * Admin:
   * Needs at least one Property.
   *
   * Agent/Supervisor:
   * Needs at least one assigned Property.
   */
  '/dashboard/inbox': {
    permission: Permissions.INBOX,
    requiresProperty: true,
  },

  /**
   * Contacts
   *
   * Does NOT depend on Property.
   *
   * Admin invites operators before assigning them.
   */
  '/dashboard/contacts': {
    permission: Permissions.CONTACTS,
    requiresProperty: false,
  },

  /**
   * Knowledge Base
   */
  '/dashboard/knowledge-base': {
    permission: Permissions.KNOWLEDGEBASE,
    requiresProperty: true,
  },

  /**
   * Setup
   *
   * Only admins should reach here.
   */
  '/dashboard/setup': {
    permission: Permissions.SETUP,
    requiresProperty: false,
    adminPropertySetup: true,
  },

  /**
   * Settings
   */
  '/dashboard/settings': {
    permission: Permissions.SETTINGS,
    requiresProperty: false,
  },
}