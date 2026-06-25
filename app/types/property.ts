// /app/types/property.ts

/* -------------------------------------------------------------------------- */
/*                             PROPERTY DETAILS                               */
/* -------------------------------------------------------------------------- */

export interface PropertyDetails {
  category: string
  subCategory: string
  region: string
  description: string
  logoUrl: string
}

/* -------------------------------------------------------------------------- */
/*                            PROPERTY SETTINGS                               */
/* -------------------------------------------------------------------------- */

export interface PropertySettings {
  themeColor: string
  headingText: string

  onlineStatus: boolean
  trackIp: boolean

  autoAssign: boolean
  aiEnabled: boolean
  aiFallbackToHuman: boolean

  responseTimeGoalMs?: number
}

/* -------------------------------------------------------------------------- */
/*                             WORKING HOURS                                  */
/* -------------------------------------------------------------------------- */

export interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

export interface WorkingHoursSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface WorkingHours {
  enabled: boolean
  timezone: string
  schedule: WorkingHoursSchedule
}

/* -------------------------------------------------------------------------- */
/*                                PROPERTY                                    */
/* -------------------------------------------------------------------------- */

export interface PropertyData {
  id: string

  accountId: string

  name: string

  domain: string

  allowedDomains: string[]

  widgetId: string

  apiKey: string

  details: PropertyDetails

  settings: PropertySettings

  workingHours: WorkingHours

  createdAt: string

  updatedAt: string
}
