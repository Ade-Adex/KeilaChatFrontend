// /scripts/embed.ts

;(async function () {
  const scriptTag = document.currentScript as HTMLScriptElement | null

  if (!scriptTag) {
    console.warn('[KeilaChat] Script tag not found.')
    return
  }

  const widgetId = scriptTag.dataset.id

  const FRONTEND_URL =
    scriptTag.dataset.frontendUrl ?? 'https://keila-chat.vercel.app'

  const API_URL =
    scriptTag.dataset.apiUrl ?? 'https://keilachatbackend.onrender.com'

  if (!widgetId) {
    console.warn('[KeilaChat] Missing data-id attribute.')
    return
  }

  /**
   * Prevent duplicate widget injection.
   */
  if (document.getElementById('keila-chat-widget-root')) {
    console.warn('[KeilaChat] Widget already initialized.')
    return
  }

  /**
   * Generate visitor ID with browser fallback.
   */
  const createVisitorId = (): string => {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID()
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  /**
   * Used to cancel pending network requests.
   */
  const controller = new AbortController()

  try {
    /* -------------------------------------------------- */
    /* Visitor Identity                                   */
    /* -------------------------------------------------- */

    let visitorTrackingId = localStorage.getItem('keila_visitor_id')

    if (!visitorTrackingId) {
      visitorTrackingId = createVisitorId()

      localStorage.setItem('keila_visitor_id', visitorTrackingId)
    }

    /* -------------------------------------------------- */
    /* Widget Initialization                              */
    /* -------------------------------------------------- */

    const initResponse = await fetch(`${API_URL}/api/v1/widget/initialize`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetId,
        visitorTrackingId,
      }),
    })

    if (!initResponse.ok) {
      let message = 'Widget initialization failed.'

      try {
        const error = await initResponse.json()

        message = error.message ?? message
      } catch {
        // Ignore JSON parse failures
      }

      console.warn('[KeilaChat]', message)

      return
    }

    const initData = await initResponse.json()

    if (initData.status !== 'success') {
      console.warn('[KeilaChat] Initialization rejected.')
      return
    }

    // const widgetConfig = initData.data

    /* -------------------------------------------------- */
    /* Widget Root Container                              */
    /* -------------------------------------------------- */

    const host = document.createElement('div')

    host.id = 'keila-chat-widget-root'

    Object.assign(host.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '2147483647',

      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    })

    document.body.appendChild(host)

    const shadowRoot = host.attachShadow({
      mode: 'open',
    })

    /* -------------------------------------------------- */
    /* Widget Iframe                                      */
    /* -------------------------------------------------- */

    const iframe = document.createElement('iframe')

    iframe.title = 'Keila Chat Widget'

    iframe.loading = 'lazy'

    iframe.allow = 'clipboard-read; clipboard-write'

    iframe.referrerPolicy = 'strict-origin-when-cross-origin'

    iframe.sandbox.add(
      'allow-scripts',
      'allow-same-origin',
      'allow-forms',
      'allow-popups',
    )

    const params = new URLSearchParams({
      widgetId,
      visitorTrackingId,
      apiUrl: API_URL,
      frontendUrl: FRONTEND_URL,
    })

    iframe.src = `${FRONTEND_URL}/embed/chat?${params.toString()}`

    Object.assign(iframe.style, {
      width: '64px',
      height: '64px',

      border: 'none',
      background: 'transparent',

      borderRadius: '999px',

      overflow: 'hidden',

      boxShadow: '0 4px 12px rgba(0,0,0,.15)',

      transition: 'width .25s ease,height .25s ease,border-radius .25s ease',
    })

    shadowRoot.appendChild(iframe)

    /* -------------------------------------------------- */
    /* Message Handler                                    */
    /* -------------------------------------------------- */

    const frontendOrigin = new URL(FRONTEND_URL).origin

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== frontendOrigin) {
        return
      }

      // if (event.source !== iframe.contentWindow) {
      //   return
      // }

      const data = event.data

      if (!data || typeof data !== 'object') {
        return
      }

      if (typeof data.type !== 'string') {
        return
      }

      switch (data.type) {
        case 'RESIZE': {
          console.log('[KeilaChat RESIZE]', data.width, data.height)

          const width = Math.min(
            Number.parseInt(data.width ?? '60', 10),
            window.innerWidth,
          )

          const height = Math.min(
            Number.parseInt(data.height ?? '60', 10),
            window.innerHeight,
          )

          const mobile = window.innerWidth <= 768

          const expanded = width > 64 || height > 64

          Object.assign(iframe.style, {
            width: `${width}px`,
            height: `${height}px`,

            position: 'fixed',

            right: mobile ? '0' : '20px',

            bottom: mobile ? '0' : '20px',

            borderRadius: expanded ? (mobile ? '0' : '16px') : '999px',

            boxShadow: expanded
              ? '0 15px 35px rgba(0,0,0,.25)'
              : '0 4px 12px rgba(0,0,0,.15)',
          })

          break
        }

        case 'SCROLL_TOP': {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })

          break
        }

        case 'FOCUS': {
          iframe.focus()

          break
        }

        default:
          break
      }
    }

    window.addEventListener('message', handleMessage)

    /* -------------------------------------------------- */
    /* Cleanup                                             */
    /* -------------------------------------------------- */

    const cleanup = () => {
      controller.abort()

      window.removeEventListener('message', handleMessage)

      if (host.parentNode) {
        host.remove()
      }
    }

    window.addEventListener('beforeunload', cleanup)

    window.addEventListener('pagehide', cleanup)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return
    }

    console.error('[KeilaChat] Failed to initialize widget:', error)
  }
})()
