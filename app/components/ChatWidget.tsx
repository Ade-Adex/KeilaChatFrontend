// /app/components/ChatWidget.tsx

'use client'
import { useEffect } from 'react'

export default function ChatWidget({ widgetId }: { widgetId: string }) {
  useEffect(() => {
    const iframe = document.createElement('iframe')

    // Ensure the parameter name (propertyId) matches what your backend API expects
    iframe.src = `https://keila-chat.vercel.app/embed/chat?propertyId=${widgetId}`

    Object.assign(iframe.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      border: 'none',
      zIndex: '9999',
    })
    document.body.appendChild(iframe)

    return () => {
      iframe.remove()
    }
  }, [widgetId])

  return null
}