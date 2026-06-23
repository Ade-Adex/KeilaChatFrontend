// app/(routes)/embed/chat/page.tsx


import ClientChatWrapper from '@/app/(routes)/embed/chat/ClientChatWrapper'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ widgetId: string }>
}) {
  const { widgetId } = await searchParams

  if (!widgetId) {
    return (
      <div className="flex justify-center items-center h-screen">
        Invalid Access
      </div>
    )
  }

  const headersList = await headers()
  const referer = headersList.get('referer') || ''

  let isAuthorized = false
  let hasConnectionError = false

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/widget/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          referer: referer,
        },
        body: JSON.stringify({ widgetId }),
      },
    )

    if (response.ok) {
      isAuthorized = true
    }
  } catch (error) {
    console.error('Verification fetch failed:', error)
    hasConnectionError = true
  }

  if (hasConnectionError) {
    return <div className="p-4 text-center text-red-500">Connection Error</div>
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 font-sans">
        Unauthorized Widget Deployment
      </div>
    )
  }

  // Pass the verified widgetId and referer (origin website property) downstream
  return <ClientChatWrapper widgetId={widgetId} originWebsite={referer} />
}