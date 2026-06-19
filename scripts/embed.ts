// /scripts/embed.ts

;(function () {
  const scriptTag = document.currentScript as HTMLScriptElement
  const widgetId = scriptTag?.getAttribute('data-id')
  if (!widgetId) return

  const BASE_URL = 'https://keila-chat.vercel.app'
  const container = document.createElement('div')
  const shadow = container.attachShadow({ mode: 'open' })
  document.body.appendChild(container)

  const iframe = document.createElement('iframe')
  iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`
  iframe.setAttribute('allowtransparency', 'true')

  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '80px', // Start as a small launcher
    height: '80px',
    border: 'none',
    zIndex: '2147483647',
    backgroundColor: 'transparent',
  })

  shadow.appendChild(iframe)

  window.addEventListener('message', (event) => {
    if (event.origin !== BASE_URL) return

    // Commands triggered by your ChatWindow.tsx
    if (event.data.type === 'RESIZE') {
      Object.assign(iframe.style, {
        width: event.data.width,
        height: event.data.height,
        top: event.data.top || 'auto',
        left: event.data.left || 'auto',
        bottom: event.data.bottom || '20px',
        right: event.data.right || '20px',
      })
    }
  })
})()
