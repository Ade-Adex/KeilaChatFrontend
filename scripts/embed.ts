// /scripts/embed.ts

interface KeilaChatInterface {
  open: () => void
  close: () => void
  toggle: () => void
}

;(function () {
  const scriptTag = document.getElementById(
    'keila-chat-chat-script',
  ) as HTMLScriptElement | null
  const widgetId = scriptTag?.getAttribute('data-widget-id')

  if (!widgetId) return

  const host = 'https://christbcogbomoso.org'
  const iframe = document.createElement('iframe')
  iframe.src = `${host}/chat-test/embed/chat?widgetId=${widgetId}`

  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    height: '500px',
    border: 'none',
    zIndex: '999999',
    display: 'none',
  })

  document.body.appendChild(iframe)

  const controls: KeilaChatInterface = {
    open: () => {
      iframe.style.display = 'block'
    },
    close: () => {
      iframe.style.display = 'none'
    },
    toggle: () => {
      iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none'
    },
  }

  // THE SOLUTION: Cast to unknown first, then to the desired interface.
  // This bypasses the strict overlap check while maintaining type safety.
  ;(window as unknown as { KeilaChat: KeilaChatInterface }).KeilaChat = controls
})()
