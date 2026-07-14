// // app/(routes)/embed/chat/layout.tsx

// import type { ReactNode } from 'react'

// interface EmbedLayoutProps {
//   children: ReactNode
// }

// export default function EmbedLayout({ children }: EmbedLayoutProps) {
//   return (
//     <>
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//             *,
//             *::before,
//             *::after {
//               box-sizing: border-box;
//             }

//             html,
//             body,
//             #__next {
//               margin: 0;
//               padding: 0;
//               width: 100%;
//               height: 100%;
//               min-width: 100%;
//               min-height: 100%;
//               overflow: visible !important;
//               background: transparent !important;
//             }
//           `,
//         }}
//       />

//       <div
//         style={{
//           position: 'fixed',
//           inset: 0,
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           overflow: 'visible',
//           background: 'transparent',
//         }}
//       >
//         {children}
//       </div>
//     </>
//   )
// }





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
              overflow: visible !important;
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
          alignItems: 'flex-end', // 🎯 FIX: Anchor item container cleanly to bottom of iframe
          justifyContent: 'flex-end', // 🎯 FIX: Match right alignment profile workflow
          overflow: 'visible',
          background: 'transparent',
          padding: '16px', // 🎯 Adds a nice spacing clearance boundary so the chat container isn't jammed hard against screen edges
        }}
      >
        {children}
      </div>
    </>
  )
}