// // /scripts/embed.ts

// (async function () {
//   const scriptTag = document.currentScript as HTMLScriptElement | null

//   if (!scriptTag) {
//     console.warn('[KeilaChat] Script tag not found.')
//     return
//   }

//   const widgetId = scriptTag.dataset.id

//   const FRONTEND_URL =
//     scriptTag.dataset.frontendUrl ?? 'https://keila-chat.vercel.app'

//   const API_URL =
//     scriptTag.dataset.apiUrl ?? 'https://keilachatbackend.onrender.com'

//   if (!widgetId) {
//     console.warn('[KeilaChat] Missing data-id attribute.')
//     return
//   }

//   /**
//    * Prevent duplicate widget injection.
//    */
//   if (document.getElementById('keila-chat-widget-root')) {
//     console.warn('[KeilaChat] Widget already initialized.')
//     return
//   }

//   /**
//    * Used to cancel pending network requests.
//    */
//   const controller = new AbortController()

//   try {
//     /* -------------------------------------------------- */
//     /* Visitor Identity Retrieval                         */
//     /* -------------------------------------------------- */
//     let visitorTrackingId = localStorage.getItem('keila_visitor_id')

//     /* -------------------------------------------------- */
//     /* Widget Initialization Handshake                    */
//     /* -------------------------------------------------- */
//     const initResponse = await fetch(`${API_URL}/api/v1/widget/initialize`, {
//       method: 'POST',
//       signal: controller.signal,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         widgetId,
//         visitorTrackingId: visitorTrackingId || undefined,
//       }),
//     })

//     if (!initResponse.ok) {
//       let message = 'Widget initialization failed.'
//       try {
//         const error = await initResponse.json()
//         message = error.message ?? message
//       } catch {
//         // Ignore JSON parse failures
//       }
//       console.warn('[KeilaChat]', message)
//       return
//     }

//     const initData = await initResponse.json()

//     console.log('[KeilaChat Debug Log] Full Init Data:', initData)

//     // 🎯 FIX: Updated the nested paths to match your buildWidgetResponse structure
//     if (initData.status !== 'success' || !initData.data?.visitor?.trackingId) {
//       console.warn(
//         '[KeilaChat] Initialization rejected or missing tracking ID.',
//       )
//       return
//     }

//     // 🎯 FIX: Pull the string property accurately from the nested visitor object
//     visitorTrackingId = initData.data.visitor.trackingId
//     localStorage.setItem('keila_visitor_id', visitorTrackingId!)

//     /* -------------------------------------------------- */
//     /* Widget Root Container                              */
//     /* -------------------------------------------------- */
//     const host = document.createElement('div')
//     host.id = 'keila-chat-widget-root'

//     Object.assign(host.style, {
//       position: 'fixed',
//       bottom: '20px',
//       right: '20px',
//       zIndex: '2147483647',
//       display: 'flex',
//       justifyContent: 'flex-end',
//       alignItems: 'flex-end',
//     })

//     document.body.appendChild(host)

//     const shadowRoot = host.attachShadow({
//       mode: 'open',
//     })

//     /* -------------------------------------------------- */
//     /* Widget Iframe                                      */
//     /* -------------------------------------------------- */
//     const iframe = document.createElement('iframe')
//     iframe.title = 'Keila Chat Widget'
//     iframe.loading = 'lazy'
//     iframe.allow = 'clipboard-read; clipboard-write'
//     iframe.referrerPolicy = 'strict-origin-when-cross-origin'

//     iframe.sandbox.add(
//       'allow-scripts',
//       'allow-same-origin',
//       'allow-forms',
//       'allow-popups',
//     )

//     const params = new URLSearchParams({
//       widgetId,
//       visitorTrackingId: visitorTrackingId!,
//       apiUrl: API_URL,
//       frontendUrl: FRONTEND_URL,
//     })

//     iframe.src = `${FRONTEND_URL}/embed/chat?${params.toString()}`

//     Object.assign(iframe.style, {
//       width: '64px',
//       height: '64px',
//       border: 'none',
//       background: 'transparent',
//       borderRadius: '999px',
//       position: 'fixed',
//       right: '20px',
//       bottom: '20px',
//       overflow: 'hidden',
//       boxShadow: '0 4px 12px rgba(0,0,0,.15)',
//       transition: 'width .25s ease,height .25s ease,border-radius .25s ease',
//     })

//     shadowRoot.appendChild(iframe)

//     /* -------------------------------------------------- */
//     /* Message Handler                                    */
//     /* -------------------------------------------------- */
//     const frontendOrigin = new URL(FRONTEND_URL).origin

//     const handleMessage = (event: MessageEvent) => {
//       if (event.origin !== frontendOrigin) {
//         return
//       }

//       const data = event.data
//       if (!data || typeof data !== 'object') {
//         return
//       }

//       if (typeof data.type !== 'string') {
//         return
//       }

//       switch (data.type) {
//         case 'RESIZE': {
//           console.log('[KeilaChat RESIZE]', data.width, data.height)

//           const width = Math.min(
//             Number.parseInt(data.width ?? '60', 10),
//             window.innerWidth,
//           )

//           const height = Math.min(
//             Number.parseInt(data.height ?? '60', 10),
//             window.innerHeight,
//           )

//           const mobile = window.screen.width <= 768
//           const expanded = width > 64 || height > 64

//           Object.assign(iframe.style, {
//             width: `${width}px`,
//             height: `${height}px`,
//             position: 'fixed',
//             right: expanded ? (mobile ? '0' : '20px') : '20px',
//             bottom: expanded ? (mobile ? '0' : '20px') : '20px',
//             borderRadius: expanded ? (mobile ? '0' : '18px') : '999px',
//             boxShadow: expanded
//               ? '0 15px 35px rgba(0,0,0,.25)'
//               : '0 4px 12px rgba(0,0,0,.15)',
//             overflow: 'visible',
//           })
//           break
//         }

//         case 'SCROLL_TOP': {
//           window.scrollTo({
//             top: 0,
//             behavior: 'smooth',
//           })
//           break
//         }

//         case 'FOCUS': {
//           iframe.focus()
//           break
//         }

//         default:
//           break
//       }
//     }

//     window.addEventListener('message', handleMessage)

//     /* -------------------------------------------------- */
//     /* Cleanup                                             */
//     /* -------------------------------------------------- */
//     const cleanup = () => {
//       controller.abort()
//       window.removeEventListener('message', handleMessage)
//       if (host.parentNode) {
//         host.remove()
//       }
//     }

//     window.addEventListener('beforeunload', cleanup)
//     window.addEventListener('pagehide', cleanup)
//   } catch (error) {
//     if (error instanceof DOMException && error.name === 'AbortError') {
//       return
//     }
//     console.error('[KeilaChat] Failed to initialize widget:', error)
//   }
// })()









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

  if (document.getElementById('keila-chat-widget-root')) {
    console.warn('[KeilaChat] Widget already initialized.')
    return
  }

  const controller = new AbortController()

  try {
    let visitorTrackingId = localStorage.getItem('keila_visitor_id')

    const initResponse = await fetch(`${API_URL}/api/v1/widget/initialize`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        widgetId,
        visitorTrackingId: visitorTrackingId || undefined,
      }),
    })

    if (!initResponse.ok) {
      let message = 'Widget initialization failed.'
      try {
        const error = await initResponse.json()
        message = error.message ?? message
      } catch {}
      console.warn('[KeilaChat]', message)
      return
    }

    const initData = await initResponse.json()

    if (initData.status !== 'success' || !initData.data?.visitor?.trackingId) {
      console.warn(
        '[KeilaChat] Initialization rejected or missing tracking ID.',
      )
      return
    }

    visitorTrackingId = initData.data.visitor.trackingId
    localStorage.setItem('keila_visitor_id', visitorTrackingId!)

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

    const shadowRoot = host.attachShadow({ mode: 'open' })

    const iframe = document.createElement('iframe')
    iframe.title = 'Keila Chat Widget'
    iframe.loading = 'lazy'
    iframe.allow = 'clipboard-read; clipboard-write; autoplay' // 🎯 Added autoplay permissions explicitly for cross-domain frames
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'

    iframe.sandbox.add(
      'allow-scripts',
      'allow-same-origin',
      'allow-forms',
      'allow-popups',
    )

    const params = new URLSearchParams({
      widgetId,
      visitorTrackingId: visitorTrackingId!,
      apiUrl: API_URL,
      frontendUrl: FRONTEND_URL,
      minimized: 'true', // 🎯 Started as minimized by default
    })

    iframe.src = `${FRONTEND_URL}/embed/chat?${params.toString()}`

    Object.assign(iframe.style, {
      width: '64px',
      height: '64px',
      border: 'none',
      background: 'transparent',
      borderRadius: '999px',
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,.15)',
      transition: 'width .25s ease,height .25s ease,border-radius .25s ease',
      zIndex: '1',
    })

    const badge = document.createElement('div')
    badge.id = 'keila-chat-badge'
    Object.assign(badge.style, {
      position: 'fixed',
      right: '22px',
      bottom: '62px',
      background: '#ef4444',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '12px',
      fontWeight: 'bold',
      height: '20px',
      minWidth: '20px',
      borderRadius: '10px',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 6px',
      boxSizing: 'border-box',
      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
      zIndex: '2',
      pointerEvents: 'none',
    })

    shadowRoot.appendChild(iframe)
    shadowRoot.appendChild(badge)

    const frontendOrigin = new URL(FRONTEND_URL).origin

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== frontendOrigin) return

      const data = event.data
      if (!data || typeof data !== 'object') return

      switch (data.type) {
        case 'UNREAD_UPDATE': {
          if (iframe.style.width === '64px' || iframe.getAttribute('data-state') === 'minimized') {
            badge.innerText = data.count.toString()
            badge.style.display = 'flex'
          }
          break
        }

        case 'UNREAD_RESET': {
          badge.style.display = 'none'
          break
        }

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

          const mobile = window.screen.width <= 768
          const expanded = width > 64 || height > 64

          // 🎯 Keep state track on element attribute to avoid race conditions with frame size checks
          iframe.setAttribute('data-state', expanded ? 'expanded' : 'minimized')

          Object.assign(iframe.style, {
            width: `${width}px`,
            height: `${height}px`,
            position: 'fixed',
            right: expanded ? (mobile ? '0' : '20px') : '20px',
            bottom: expanded ? (mobile ? '0' : '20px') : '20px',
            borderRadius: expanded ? (mobile ? '0' : '18px') : '999px',
            boxShadow: expanded
              ? '0 15px 35px rgba(0,0,0,.25)'
              : '0 4px 12px rgba(0,0,0,.15)',
            overflow: expanded ? 'hidden' : 'visible',
          })

          if (expanded) {
            badge.style.display = 'none'
          }
          break
        }

        case 'SCROLL_TOP': {
          window.scrollTo({ top: 0, behavior: 'smooth' })
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
    if (error instanceof DOMException && error.name === 'AbortError') return
    console.error('[KeilaChat] Failed to initialize widget:', error)
  }
})()