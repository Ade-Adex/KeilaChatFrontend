// /app/hooks/useChatSocket.ts

import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getChatSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ['websocket'],
    })
  }

  return socket
}