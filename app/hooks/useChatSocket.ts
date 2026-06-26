// /app/hooks/useChatSocket.ts

'use client'

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getChatSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      autoConnect: false,

      transports: ['websocket', 'polling'],

      reconnection: true,

      reconnectionAttempts: 10,

      reconnectionDelay: 1000,

      timeout: 20000,
    })
  }

  return socket
}