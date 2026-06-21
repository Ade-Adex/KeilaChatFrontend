// /src/types/auth.ts

export interface IPropertyDetails {
  category: string
  subCategory: string
  region: string
  description: string
  propertyImageUrl: string
}

export interface IPropertySettings {
  themeColor: string
  headingText: string
  onlineStatus: boolean
  trackIp: boolean
}

export interface PropertyData {
  id: string
  widgetId: string
  name: string
  domain: string
  details: IPropertyDetails
  settings: IPropertySettings
}

export interface AccountData {
  id: string
  name: string
  ownerEmail: string
  plan: 'free' | 'premium' | 'enterprise'
}

export interface UserSession {
  id: string
  name: string
  email: string
  plan: string
  property: PropertyData | null 
  accessToken: string
}
