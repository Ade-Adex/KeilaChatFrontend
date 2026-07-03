// hooks/settings/useWidgetSetup.ts

'use client'

import { useState } from 'react'
import { usePropertySetup } from './usePropertySetup'

export function useWidgetSetup() {
  const { property, loading, error } = usePropertySetup()

  const [revealWidgetId, setRevealWidgetId] = useState(false)

  const isNotFoundError = error?.toLowerCase().includes('not found')

  const isNotRegistered =
    !property || !property.domain || !property.widgetId || isNotFoundError

  const widgetId = property?.widgetId ?? 'YOUR_WIDGET_ID'

  const getDisplayId = (id?: string) => {
    if (!id) return 'Not configured'

    if (revealWidgetId) return id

    return `${id.slice(0, 8)}••••••••••••••••`
  }

  const htmlScript = `<script
  src="https://keila-chat.vercel.app/embed.js"
  data-id="${widgetId}"
  async>
</script>`

  const nextJsScript = `import Script from 'next/script'

<Script
  src="https://keila-chat.vercel.app/embed.js"
  strategy="afterInteractive"
  data-id="${widgetId}"
/>`

  return {
    property,
    loading,
    error,

    revealWidgetId,
    setRevealWidgetId,

    isNotFoundError,
    isNotRegistered,

    widgetId,
    getDisplayId,

    htmlScript,
    nextJsScript,
  }
}