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

  // Initial Style: The "Bubble" state
  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    border: 'none',
    zIndex: '2147483647',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    cursor: 'pointer', 
  })

  shadow.appendChild(iframe)

  window.addEventListener('message', (event) => {
    if (event.origin !== BASE_URL) return

    if (event.data.type === 'RESIZE') {
      const isOpening = event.data.width !== '60px' // Heuristic: if width is not 80px, it's opening

      Object.assign(iframe.style, {
        width: event.data.width,
        height: event.data.height,
        top: event.data.top || 'auto',
        left: event.data.left || 'auto',
        bottom: event.data.bottom || '20px',
        right: event.data.right || '20px',
        borderRadius: isOpening ? '20px' : '50%',
        boxShadow: isOpening ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.15)'
      })
    }
  })
})()
