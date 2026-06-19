// /scripts/embed.ts

(function () {
  const scriptTag = document.currentScript;
  const widgetId = scriptTag?.getAttribute('data-id');
  if (!widgetId) return;

  const BASE_URL = 'https://keila-chat.vercel.app';
  
  // 1. Create a Shadow DOM container to prevent CSS conflicts
  const container = document.createElement('div');
  const shadow = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  // 2. Inject the Chat Iframe
  const iframe = document.createElement('iframe');
  iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`;
  
  // 3. Style it professionally
  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px', // or '80px' if closed
    height: '500px',
    border: 'none',
    zIndex: '2147483647',
    display: 'block' 
  });

  shadow.appendChild(iframe);

  // 4. Handle incoming messages from the Iframe
  window.addEventListener('message', (event) => {
    if (event.origin !== BASE_URL) return;
    
    // Example: Iframe tells host to resize
    if (event.data.type === 'RESIZE') {
      iframe.style.width = event.data.width;
      iframe.style.height = event.data.height;
    }
  });
})();
