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
          top: '8px',      
          right: '0px',
          bottom: '0px',
          left: '0px',
          display: 'flex',
          alignItems: 'flex-end', 
          justifyContent: 'flex-end',
          overflow: 'visible',
          background: 'transparent',
          padding: '0 16px 16px 16px', 
        }}
      >
        {children}
      </div>
    </>
  )
}