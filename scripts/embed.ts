// // /scripts/embed.ts
// ;(function () {
//   const scriptTag = document.currentScript as HTMLScriptElement | null
//   const widgetId = scriptTag?.getAttribute('data-id')

//   if (!widgetId) return

//   const BASE_URL = 'https://keila-chat.vercel.app'

//   // Prevent multiple initializations
//   if (window.KeilaChat) return

//   const container = document.createElement('div')
//   container.id = 'keila-chat-container'
//   document.body.appendChild(container)

//   const iframe = document.createElement('iframe')
//   iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`

//   Object.assign(iframe.style, {
//     position: 'fixed',
//     bottom: '20px',
//     right: '20px',
//     width: '350px',
//     height: '500px',
//     border: 'none',
//     zIndex: '999999',
//     display: 'none',
//     boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
//     borderRadius: '16px',
//   })

//   container.appendChild(iframe)

//   window.KeilaChat = {
//     open: () => (iframe.style.display = 'block'),
//     close: () => (iframe.style.display = 'none'),
//     toggle: () =>
//       (iframe.style.display =
//         iframe.style.display === 'none' ? 'block' : 'none'),
//   }
// })()




;(function () {
  const scriptTag = document.currentScript as HTMLScriptElement | null
  const widgetId = scriptTag?.getAttribute('data-id')
  if (!widgetId) return

  const BASE_URL = 'https://keila-chat.vercel.app'
  if (window.KeilaChat) return

  // Create a container that sits on top of everything
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.bottom = '0'
  container.style.right = '0'
  container.style.width = '400px' // Max width
  container.style.height = '90vh' // Max height
  container.style.zIndex = '999999'
  container.style.pointerEvents = 'none' // Allows clicking through to the site
  document.body.appendChild(container)

  const iframe = document.createElement('iframe')
  iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`
  
  Object.assign(iframe.style, {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: 'transparent',
    pointerEvents: 'auto', // Re-enable clicking only for the iframe
  })

  container.appendChild(iframe)

  window.KeilaChat = {
    open: () => (iframe.style.display = 'block'),
    close: () => (iframe.style.display = 'none'),
    toggle: () => (iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none'),
  }
})()