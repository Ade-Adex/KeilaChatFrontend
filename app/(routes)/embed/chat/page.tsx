// app/(routes)/embed/chat/page.tsx

import { WidgetConfig } from '@/app/types/chat'
import ClientChatWrapper from './ClientChatWrapper'
import { headers } from 'next/headers'
import { verifyWidget } from '@/app/lib/api/chat.api'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    widgetId?: string
    visitorTrackingId?: string
    apiUrl?: string
    frontendUrl?: string
  }>
}

export default async function EmbedPage({ searchParams }: Props) {
  const params = await searchParams

  const widgetId = params.widgetId
  const visitorTrackingId = params.visitorTrackingId

  if (!widgetId || !visitorTrackingId) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-red-500">
        Invalid Widget Configuration
      </div>
    )
  }

  const headerStore = await headers()
  const referer = headerStore.get('referer') ?? ''

  let widget: WidgetConfig | null = null
  let errorMessage: string | null = null

  try {
    const result = await verifyWidget(widgetId, {
      referer,
      'cache-control': 'no-store',
    })
    widget = result.data
  } catch (error: unknown) {
    console.error('Widget verification failed:', error)

    // 🎯 SAFE TYPE GUARD: Narrow down the unknown error type cleanly
    if (error instanceof Error && error.message === 'Request failed') {
      errorMessage = 'Unauthorized Widget'
    } else {
      errorMessage = 'Connection Error'
    }
  }

  if (errorMessage) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-red-500">
        {errorMessage}
      </div>
    )
  }

  return (
    <ClientChatWrapper
      widgetId={widgetId}
      visitorTrackingId={visitorTrackingId}
      widget={widget}
    />
  )
}
