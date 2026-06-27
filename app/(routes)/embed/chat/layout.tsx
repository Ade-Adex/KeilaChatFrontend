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
            html,
            body{
              margin:0;
              padding:0;
              width:100%;
              height:100%;
              overflow:hidden;
              background:transparent !important;
            }
          `,
        }}
      />

      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'transparent',
        }}
      >
        {children}
      </div>
    </>
  )
}
