// /app/hooks/useEmbedResize.ts

'use client'

import { useEffect } from 'react'

export function useEmbedResize(open: boolean) {
  useEffect(() => {
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    const isMobile = screenWidth <= 768

    const width = open ? (isMobile ? screenWidth : 420) : 64

    const height = open ? (isMobile ? screenHeight : 760) : 64

    window.parent.postMessage(
      {
        type: 'RESIZE',
        width,
        height,
      },
      '*',
    )
  }, [open])
}