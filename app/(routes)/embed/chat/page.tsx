// app/(routes)/embed/chat/page.tsx

import ClientChatWrapper from './ClientChatWrapper'
import { headers } from 'next/headers'

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

  let widget = null
  let errorMessage: string | null = null

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/widget/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          referer,
        },
        body: JSON.stringify({
          widgetId,
        }),
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      errorMessage = 'Unauthorized Widget'
    } else {
      const result = await response.json()
      widget = result.data
    }
  } catch (error) {
    console.error('Widget verification failed:', error)
    errorMessage = 'Connection Error'
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
