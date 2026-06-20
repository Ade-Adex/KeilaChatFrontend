// /scripts/embed.ts


(async function () {
  const scriptTag = document.currentScript as HTMLScriptElement
  const widgetId = scriptTag?.getAttribute('data-id')
  if (!widgetId) return

  const BASE_URL = 'https://keila-chat.vercel.app'
  
  // 1. Retrieve or Generate Persistent Visitor ID
  let visitorTrackingId = localStorage.getItem('keila_visitor_id')
  if (!visitorTrackingId) {
    visitorTrackingId = crypto.randomUUID()
    localStorage.setItem('keila_visitor_id', visitorTrackingId)
  }

  try {
    // 2. THE GATEKEEPER: Verify domain authorization before rendering anything
    const response = await fetch(`${BASE_URL}/api/v1/widget/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgetId, visitorTrackingId }),
    })

    // If the server returns a 403 or any error, we stop the execution entirely
    if (!response.ok) {
      console.warn('[KeilaChat] Unauthorized or invalid widget configuration.')
      return 
    }

    // 3. If authorized, proceed to inject the UI
    const container = document.createElement('div')
    const shadow = container.attachShadow({ mode: 'open' })
    document.body.appendChild(container)

    const iframe = document.createElement('iframe')
    iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`
    iframe.setAttribute('allowtransparency', 'true')

    // Initial Style
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

    // 4. Message Handling for Resizing
    window.addEventListener('message', (event) => {
      if (event.origin !== BASE_URL) return

      if (event.data.type === 'RESIZE') {
        const isOpening = event.data.width !== '60px'

        Object.assign(iframe.style, {
          width: event.data.width,
          height: event.data.height,
          top: event.data.top || 'auto',
          left: event.data.left || 'auto',
          bottom: event.data.bottom || '20px',
          right: event.data.right || '20px',
          borderRadius: isOpening ? '0px' : '50%',
          boxShadow: isOpening ? '0 10px 25px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.15)'
        })
      }
    })

  } catch (error) {
    // Fail silently so the user's website doesn't crash if your server is down
    console.error('[KeilaChat] Failed to initialize:', error)
  }
})()