// /app/types/settings.ts

import type { AccountData } from './account'
import type { OperatorData } from './operator'
import type { PropertyData } from './property'

export interface SettingsResponse {
  success: boolean
  data: {
    account: AccountData
    operator: OperatorData
    property: PropertyData
  }
}
