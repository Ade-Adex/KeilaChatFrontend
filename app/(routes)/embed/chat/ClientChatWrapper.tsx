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
   console.log('WINDOW WIDTH', window.innerWidth)

  //  const mobile = window.innerWidth < 640
  const mobile = window.parent.innerWidth < 640

   console.log('IS MOBILE', mobile)

   const width = open ? (mobile ? window.innerWidth : 380) : 60

   const height = open ? (mobile ? window.innerHeight : 650) : 60

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
