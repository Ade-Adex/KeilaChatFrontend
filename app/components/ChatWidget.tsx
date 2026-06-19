// // /app/components/ChatWidget.tsx
// 'use client'
// import { useEffect } from 'react'

// export default function ChatWidget({ widgetId }: { widgetId: string }) {
//   useEffect(() => {
//     const iframe = document.createElement('iframe')
//     iframe.src = `https://keila-chat.vercel.app/embed/chat?propertyId=${widgetId}`

//     Object.assign(iframe.style, {
//       position: 'fixed',
//       bottom: '0',
//       right: '0',
//       width: '100%',
//       height: '100%',
//       border: 'none',
//       zIndex: '2147483647',
//       backgroundColor: 'transparent',
//       // Optional: limit size on desktop
//       maxWidth: '400px',
//       maxHeight: '90vh',
//     })
//     document.body.appendChild(iframe)

//     return () => {
//       iframe.remove()
//     }
//   }, [widgetId])

//   return null
// }