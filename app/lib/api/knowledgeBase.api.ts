// /app/lib/api/knowledgeBase.api.ts

import { apiClient } from '@/app/lib/api/apiClient'
import type { IKnowledgeBase } from '@/app/types/knowledgeBase'

/**
 * Fetch Knowledge Base configurations for the active workspace
 */
export function getKnowledgeBaseSettings(propertyId: string) {
  return apiClient<{ success: boolean; data: IKnowledgeBase }>(
    `/api/v1/knowledge-base`,
    {
      method: 'GET',
      headers: { 'x-property-id': propertyId },
    },
  )
}

/**
 * Update and sync Knowledge Base configurations for the active workspace
 */
export function updateKnowledgeBaseSettings(
  propertyId: string,
  payload: Partial<IKnowledgeBase>,
) {
  // 🎯 FIX: Explicitly bundle headers and payload so apiClient merges the object structure correctly
  return apiClient<{ success: boolean; message: string; data: IKnowledgeBase }>(
    `/api/v1/knowledge-base`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'x-property-id': propertyId,
      },
      body: JSON.stringify(payload),
    },
  )
}

/**
 * Send a quick semantic search query to the test playground sandbox environment
 */
export function testPlaygroundQuery(propertyId: string, message: string) {
  return apiClient<{
    matched: boolean
    answer?: string
    confidenceScore?: number
  }>(`/api/v1/knowledge-base/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-property-id': propertyId,
    },
    body: JSON.stringify({ message }),
  })
}
