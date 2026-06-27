'use client'

import { useEffect, useState } from 'react'

import ChatWindow from '@/app/components/chat/ChatWindow'
import { ChatLauncher } from '@/app/components/chat/ChatLauncher'
import { WidgetConfig } from '@/app/types/chat'

interface Props {
  widgetId: string
  visitorTrackingId: string
  widget: WidgetConfig
}

export default function ClientChatWrapper({
  widgetId,
  visitorTrackingId,
  widget,
}: Props) {
  const [open, setOpen] = useState(false)

 useEffect(() => {
   console.log('OPEN STATE', open)

   const parentWidth = window.screen.width || 390

   const parentHeight = window.screen.height || 800

   const mobile = parentWidth < 640

   console.log('SCREEN WIDTH', parentWidth)
   console.log('IS MOBILE', mobile)

   const width = !open ? 60 : mobile ? parentWidth : 380

   const height = !open ? 60 : mobile ? parentHeight : 650

   console.log('CALCULATED', width, height)

   window.parent.postMessage(
     {
       type: 'RESIZE',
       width,
       height,
     },
     '*',
   )
 }, [open])
  
  return (
    <div className="w-full h-full">
      {open ? (
        <ChatWindow
          widget={widget}
          widgetId={widgetId}
          visitorTrackingId={visitorTrackingId}
          onClose={() => setOpen(false)}
        />
      ) : (
        <ChatLauncher onClick={() => setOpen(true)} widget={widget} />
      )}
    </div>
  )
}
