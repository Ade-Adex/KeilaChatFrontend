//  /app/(routes)/admin/dashboard/page.tsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import {
  FiBriefcase,
  FiSend,
  FiUser,
  FiLogOut,
  FiAward,
  FiShield,
} from 'react-icons/fi'
import { useAuthStore } from '@/app/store/useAuthStore'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

interface BackendSession {
  _id: string
  propertyId: string
  lastMessageText?: string
  updatedAt: string
  createdAt: string
}

interface ThreadSummary {
  sessionId: string
  propertyId: string
  lastMessageText: string
  updatedAt: string
}

interface MessagePayload {
  _id?: string
  sessionId: string
  senderType: 'visitor' | 'operator' | 'system'
  senderId: string
  messageText: string
  createdAt?: string
}

interface IncomingAlertPayload {
  sessionId: string
  messageText: string
}

interface ApiResponse {
  status: string
  data: {
    sessions: BackendSession[]
  }
}

interface HistoryResponse {
  status: string
  data: {
    messages: MessagePayload[]
  }
}

export default function AdminDashboardPage() {
  const router = useRouter()

  const user = useAuthStore((state) => state.user)

  // console.log("Admin", user)

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isVisitorTyping, setIsVisitorTyping] = useState(false)

  const logout = useAuthStore((state) => state.logout)
  const authLoading = useAuthStore((state) => state.loading)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  const socketRef = useRef<Socket | null>(null)
  const feedEndRef = useRef<HTMLDivElement | null>(null)

  const [activeThreads, setActiveThreads] = useState<ThreadSummary[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [operatorInput, setOperatorInput] = useState('')

  useEffect(() => {
    if (hasHydrated && !authLoading && !user) {
      router.push('/admin/login')
    }
  }, [user, authLoading, hasHydrated, router])

  // Pipeline 1: Property Dashboard Management Room
  useEffect(() => {
    if (!user || !user.currentPropertyId) return

    const propertyId = user.currentPropertyId
    const socketInstance = io(BACKEND_URL, {
      auth: { token: user.accessToken },
    })
    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      socketInstance.emit('join_property_dashboard', { propertyId })
    })

    // Catch real-time workspace alert signals sent from visitors
    socketInstance.on(
      'incoming_visitor_alert',
      (payload: IncomingAlertPayload) => {
        setActiveThreads((prev) => {
          const filtered = prev.filter((t) => t.sessionId !== payload.sessionId)
          const updated: ThreadSummary = {
            sessionId: payload.sessionId,
            propertyId,
            lastMessageText: payload.messageText,
            updatedAt: new Date().toISOString(),
          }
          return [updated, ...filtered]
        })
      },
    )

    fetch(`${BACKEND_URL}/api/v1/sessions/property/${propertyId}`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
      .then((res) => res.json())
      .then((resData: ApiResponse) => {
        if (resData.status === 'success' && resData.data.sessions) {
          const formatted: ThreadSummary[] = resData.data.sessions.map(
            (s: BackendSession) => ({
              sessionId: s._id,
              propertyId: s.propertyId,
              lastMessageText: s.lastMessageText || 'No messages generated yet',
              updatedAt: s.updatedAt,
            }),
          )
          setActiveThreads(formatted)
        }
      })
      .catch((err) => console.error('Failed processing dashboard queue:', err))

    return () => {
      socketInstance.disconnect()
    }
  }, [user])

  // Pipeline 2: Dedicated Message Feed Room Tracking
  useEffect(() => {
    if (!selectedSessionId || !user || !socketRef.current) return

    const currentSocket = socketRef.current

    currentSocket.emit('join_chat_session', { sessionId: selectedSessionId })

    fetch(`${BACKEND_URL}/api/v1/sessions/${selectedSessionId}/messages`, {
      headers: { Authorization: `Bearer ${user.accessToken}` },
    })
      .then((res) => res.json())
      .then((resData: HistoryResponse) => {
        if (resData.status === 'success') {
          setMessages(resData.data.messages || [])
        }
      })
      .catch((err) => console.error('History integration break:', err))

    // Handle Visitor Typing Indicator
    currentSocket.on(
      'user_typing',
      (payload: { senderName: string; isTyping: boolean }) => {
        // Logic: Only update if the typing event matches the current session
        setIsVisitorTyping(payload.isTyping)
      },
    )

    currentSocket.on('new_message', (payload: MessagePayload) => {
      if (payload.sessionId === selectedSessionId) {
        setIsVisitorTyping(false) // Reset on message receipt
        setMessages((prev) => {
          if (payload._id && prev.some((m) => m._id === payload._id))
            return prev
          return [...prev, payload]
        })
      }

      setActiveThreads((prev) =>
        prev.map((t) =>
          t.sessionId === payload.sessionId
            ? {
                ...t,
                lastMessageText: payload.messageText,
                updatedAt: payload.createdAt || new Date().toISOString(),
              }
            : t,
        ),
      )
    })

    return () => {
      currentSocket.off('new_message')
      currentSocket.off('user_typing')
    }
  }, [selectedSessionId, user])

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

 const sendTypingStatus = (isTyping: boolean) => {
   if (!socketRef.current || !selectedSessionId) return
   socketRef.current.emit('typing', {
     sessionId: selectedSessionId,
     senderName: user?.name || 'Operator',
     isTyping,
   })
 }

 const sendResponse = () => {
   if (
     !socketRef.current ||
     !operatorInput.trim() ||
     !selectedSessionId ||
     !user
   )
     return

   // Stop typing indicator when sending
   if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
   sendTypingStatus(false)

   socketRef.current.emit('send_message', {
     sessionId: selectedSessionId,
     propertyId: user.currentPropertyId,
     senderType: 'operator',
     senderId: user.id,
     senderName: user.name,
     messageText: operatorInput,
   })
   setOperatorInput('')
 }

  if (!hasHydrated || authLoading || !user) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center text-zinc-400 font-sans">
        <p className="animate-pulse text-sm">
          Verifying secure pipeline permissions...
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-[#ededed] font-sans select-none">
      {/* SIDEBAR CONTAINER */}
      <div className="w-80 border-r border-[#222] bg-[#111] flex flex-col justify-between">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-[#222] flex items-center justify-between text-white font-bold text-lg">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-[#10b981]" />
              <span>Keila Operator</span>
            </div>
            <button
              onClick={() => logout()}
              className="text-zinc-500 hover:text-red-400 p-1"
              title="Log out"
            >
              <FiLogOut size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {activeThreads.length === 0 ? (
              <p className="text-zinc-500 text-xs text-center pt-8">
                No active chat sessions found.
              </p>
            ) : (
              activeThreads.map((thread) => {
                const isSelected = thread.sessionId === selectedSessionId
                return (
                  <button
                    key={thread.sessionId}
                    onClick={() => setSelectedSessionId(thread.sessionId)}
                    className={`w-full text-left p-3 rounded-lg block transition-colors ${
                      isSelected
                        ? 'bg-[#0070f3] text-white'
                        : 'bg-[#161616] hover:bg-[#222] text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <FiUser />
                      <span className="truncate">
                        Session: ...{thread.sessionId.substring(16)}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate mt-1 ${isSelected ? 'text-blue-100' : 'text-zinc-500'}`}
                    >
                      {thread.lastMessageText}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ADMIN ACCOUNT CARD */}
        <div className="p-4 border-t border-[#222] bg-[#141414] space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5 max-w-[75%]">
              <h4 className="text-sm font-semibold text-white truncate">
                {user.name}
              </h4>
              <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            </div>
            <span
              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                user.plan === 'premium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border border-[#333]'
              }`}
            >
              <FiAward size={10} />
              {user.plan}
            </span>
          </div>
          <div className="pt-2 border-t border-[#222] flex items-center justify-between text-[11px] text-zinc-500">
            <span className="flex items-center gap-1 text-emerald-500">
              <FiShield size={12} /> Status: Active
            </span>
            <span className="text-zinc-600">
              ID: ...{user.id.substring(16)}
            </span>
          </div>
        </div>
      </div>

      {/* CORE ACTIVE CONVERSATION WORKSPACE */}
      <div className="flex-1 flex flex-col bg-[#050505]">
        {selectedSessionId ? (
          <>
            <div className="p-4 border-b border-[#222] bg-[#111]">
              <h2 className="text-sm font-semibold text-white">
                Active Thread: {selectedSessionId}
              </h2>
              {isVisitorTyping && (
                <p className="text-[10px] text-[#10b981] mt-1 animate-pulse italic">
                  Visitor is typing...
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => {
                const isOp = msg.senderType === 'operator'

                // Provide a fallback of new Date() if createdAt is undefined
                const dateValue = msg.createdAt
                  ? new Date(msg.createdAt)
                  : new Date()

                const time = dateValue.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col ${isOp ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-[70%] text-sm ${isOp ? 'bg-[#10b981]' : 'bg-[#222]'}`}
                    >
                      {msg.messageText}
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1 px-1">
                      {isOp ? 'You' : 'Visitor'} • {time}
                    </span>
                  </div>
                )
              })}
              <div ref={feedEndRef} />
            </div>

            <div className="p-4 border-t border-[#222] bg-[#111] flex gap-2">
              <input
                type="text"
                placeholder="Type response back to client..."
                value={operatorInput}
                onChange={(e) => {
                  setOperatorInput(e.target.value)
                  sendTypingStatus(true)
                  if (typingTimerRef.current)
                    clearTimeout(typingTimerRef.current)
                  typingTimerRef.current = setTimeout(
                    () => sendTypingStatus(false),
                    2000,
                  )
                }}
                onKeyDown={(e) => e.key === 'Enter' && sendResponse()}
                className="flex-1 bg-[#222] text-white border border-[#333] rounded-lg px-4 py-2 text-sm outline-none focus:border-[#10b981] transition-colors"
              />
              <button
                onClick={sendResponse}
                className="bg-[#10b981] hover:bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span>Reply</span>
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-sm">
            <span>
              Select an active conversation from the routing matrix sidebar
              column
            </span>
          </div>
        )}
      </div>
    </div>
  )
}