// /app/types/knowledgeBase.ts

export type AiMode = 'disabled' | 'knowledge_only' | 'hybrid'
export type FallbackStrategy = 'human' | 'clarify' | 'fallback'

export interface IFaqItem {
  _id?: string
  question: string
  answer: string
  category: string
  enabled: boolean
  priority: number
  keywords: string[]
}

export interface IKnowledgeBase {
  _id?: string
  accountId: string
  propertyId: string
  isAiEnabled: boolean
  aiMode: AiMode
  confidenceThreshold: number
  fallbackStrategy: FallbackStrategy
  humanHandoffEnabled: boolean
  fallbackMessage: string
  welcomeMessage: string
  maxResults: number
  categories: string[]
  faqs: IFaqItem[]
}