// /app/dashboard/settings/validation/settings.schema.ts

import { z } from 'zod'

/* -------------------------------------------------------------------------- */
/*                               PROFILE FORM                                 */
/* -------------------------------------------------------------------------- */

export const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50),

  email: z.string().trim().email('Enter a valid email address'),

  avatar: z.string().trim().url('Avatar must be a valid URL').or(z.literal('')),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

/* -------------------------------------------------------------------------- */
/*                              WORKSPACE FORM                                */
/* -------------------------------------------------------------------------- */

export const workspaceSchema = z.object({
  companyName: z.string().trim().min(2, 'Company name is required').max(120),
})

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>

/* -------------------------------------------------------------------------- */
/*                              WEBSITE DETAILS                               */
/* -------------------------------------------------------------------------- */


export const websiteSchema = z.object({
  name: z.string().trim().min(2, 'Website name is required'),

  domain: z.string().trim().min(1, 'Domain is required'),

  category: z.string(),

  subCategory: z.string(),

  region: z.string(),

  description: z.string(),

  logoUrl: z.string().trim().url('Logo URL must be valid').or(z.literal('')),

  allowedDomains: z.string(),
})

export type WebsiteFormValues = z.infer<typeof websiteSchema>

/* -------------------------------------------------------------------------- */
/*                           WIDGET SETTINGS                                  */
/* -------------------------------------------------------------------------- */

export const widgetSettingsSchema = z.object({
  headingText: z.string().trim().min(2).max(80),

  themeColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid hex color'),

  onlineStatus: z.boolean(),

  trackIp: z.boolean(),

  autoAssign: z.boolean(),

  aiEnabled: z.boolean(),

  aiFallbackToHuman: z.boolean(),
})

export type WidgetSettingsValues = z.infer<typeof widgetSettingsSchema>

/* -------------------------------------------------------------------------- */
/*                             WORKING HOURS                                  */
/* -------------------------------------------------------------------------- */

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
})

export const workingHoursSchema = z.object({
  enabled: z.boolean(),

  timezone: z.string().trim(),

  schedule: z.record(
    z.string(),
    dayScheduleSchema,
  ),
})

export type DaySchedule = z.infer<typeof dayScheduleSchema>

export type WorkingHoursValues = z.infer<typeof workingHoursSchema>

/* -------------------------------------------------------------------------- */
/*                             SECURITY FORM                                  */
/* -------------------------------------------------------------------------- */

export const securitySchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),

    newPassword: z.string().min(8, 'Password must be at least 8 characters'),

    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SecurityFormValues = z.infer<typeof securitySchema>



