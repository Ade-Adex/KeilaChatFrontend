// app/(routes)/embed/chat/layout.tsx

import type { ReactNode } from 'react'

interface EmbedLayoutProps {
  children: ReactNode
}

export default function EmbedLayout({ children }: EmbedLayoutProps) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            *,
            *::before,
            *::after {
              box-sizing: border-box;
            }

            html,
            body,
            #__next {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              min-width: 100%;
              min-height: 100%;
              overflow: visible !important; /* 🎯 FIX: Allow child items to be visible */
              background: transparent !important;
            }
          `,
        }}
      />

      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          background: 'transparent',
        }}
      >
        {children}
      </div>
    </>
  )
}