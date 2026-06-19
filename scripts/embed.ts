// /scripts/embed.ts

(function () {
  const scriptTag = document.currentScript as HTMLScriptElement;
  const widgetId = scriptTag?.getAttribute('data-id');
  if (!widgetId) return;

  const BASE_URL = 'https://keila-chat.vercel.app';
  const container = document.createElement('div');
  const shadow = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  const iframe = document.createElement('iframe');
  iframe.src = `${BASE_URL}/embed/chat?widgetId=${widgetId}`;
  
  // Professional Styling: Default to a "Closed/Launcher" state
  Object.assign(iframe.style, {
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    width: '350px', // Normal desktop launcher size
    height: '500px',
    border: 'none',
    zIndex: '2147483647',
    backgroundColor: 'transparent' // Essential for transparency
  });

  shadow.appendChild(iframe);

  // Responsive logic: Resize for mobile
  window.addEventListener('message', (event) => {
    if (event.origin !== BASE_URL) return;
    
    if (event.data.type === 'FULLSCREEN') {
      Object.assign(iframe.style, { width: '100vw', height: '100vh', top: '0', left: '0' });
    } else if (event.data.type === 'NORMAL') {
      Object.assign(iframe.style, { width: '350px', height: '500px', top: 'auto', left: 'auto' });
    }
  });
})();
