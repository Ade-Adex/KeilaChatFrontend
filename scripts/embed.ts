// /scripts/embed.ts

export {} // Ensure this file is treated as a module

;(function () {
  const scriptTag = document.getElementById(
    'keila-chat-script',
  ) as HTMLScriptElement | null

  const widgetId = scriptTag?.getAttribute('data-widget-id')

  if (!widgetId) {
    console.warn('KeilaChat: Missing data-widget-id attribute.')
    return
  }

  const BASE_URL = 'https://keila-chat.vercel.app'

  // 1. Create Container
  const container = document.createElement('div')
  container.id = 'keila-chat-container'
  document.body.appendChild(container)

  // 2. Create Iframe
  const iframe = document.createElement('iframe')
  iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`

  // Apply styles securely
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

  container.appendChild(iframe)

  // 3. Expose Controls to Window
  // TypeScript now knows 'window.KeilaChat' exists because of src/types/window.d.ts
  window.KeilaChat = {
    open: () => (iframe.style.display = 'block'),
    close: () => (iframe.style.display = 'none'),
    toggle: () =>
      (iframe.style.display =
        iframe.style.display === 'none' ? 'block' : 'none'),
  }
})()