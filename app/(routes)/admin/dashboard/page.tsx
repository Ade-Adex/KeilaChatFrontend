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
  FiArrowLeft,
} from 'react-icons/fi'
import { useAuthStore } from '@/app/store/useAuthStore'
import ThemeToggle from '@/app/components/ThemeToggle'
import TypingIndicator from '@/app/components/TypingIndicator'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

interface BackendSession {
  _id: string
  propertyId: string
  lastMessageText?: string
  updatedAt: string
  createdAt: string
  status: 'unassigned' | 'active' | 'closed'
}

interface ThreadSummary {
  sessionId: string
  propertyId: string
  lastMessageText: string
  updatedAt: string
  status: 'unassigned' | 'active' | 'closed'
}

interface MessagePayload {
  _id?: string
  sessionId: string
  senderType: 'visitor' | 'operator' | 'system'
  senderId: string
  senderName: string
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

const getGroupDate = (dateString?: string) => {
  if (!dateString) return 'Today'
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const authLoading = useAuthStore((state) => state.loading)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  const socketRef = useRef<Socket | null>(null)
  const feedEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [activeThreads, setActiveThreads] = useState<ThreadSummary[]>([])
const [isLoadingThreads, setIsLoadingThreads] = useState(true) 
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [operatorInput, setOperatorInput] = useState('')
  const [isVisitorTyping, setIsVisitorTyping] = useState(false)

  const selectedThread = activeThreads.find(
    (t) => t.sessionId === selectedSessionId,
  )
  const isSessionClosed = selectedThread?.status === 'closed'

  useEffect(() => {
    if (hasHydrated && !authLoading && !user) {
      router.push('/signin')
    }
  }, [user, authLoading, hasHydrated, router])

  // Pipeline 1: Property Dashboard Management Room
  useEffect(() => {
    if (!user || !user.currentPropertyId) return

    console.log('User', user)
    setIsLoadingThreads(true)

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
            status: 'active',
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
              status: s.status,
            }),
          )
          setActiveThreads(formatted)
        }
      })
      .catch((err) => console.error('Failed processing dashboard queue:', err))
    .finally(() => setIsLoadingThreads(false))

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
        setIsVisitorTyping(false)
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
                status: t.status,
              }
            : t,
        ),
      )
    })

    currentSocket.on('session_closed', (payload: { sessionId: string }) => {
      setActiveThreads((prev) =>
        prev.map((t) =>
          t.sessionId === payload.sessionId ? { ...t, status: 'closed' } : t,
        ),
      )
    })

    return () => {
      currentSocket.off('new_message')
      currentSocket.off('user_typing')
      currentSocket.off('session_closed')
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

  const handleEndSession = async () => {
    if (!selectedSessionId || !user) return

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/sessions/${selectedSessionId}/end`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({ endedBy: 'admin' }),
        },
      )

      if (response.ok) {
        // Clear the selected session or refresh list
        setSelectedSessionId(null)
        // Optional: Remove from activeThreads locally
        setActiveThreads((prev) =>
          prev.filter((t) => t.sessionId !== selectedSessionId),
        )
      }
    } catch (err) {
      console.error('Failed to end session:', err)
    }
  }

  if (!hasHydrated || authLoading || !user) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center text-zinc-400 font-sans">
        <p className="animate-pulse text-sm text-foreground">
          Verifying secure pipeline permissions...
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full bg-[#ffffff] text-[#ededed] font-sans select-none overflow-hidden">
      <div
        className={`w-full md:w-80 border-r border-border bg-sidebar flex flex-col justify-between ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between font-bold text-lg text-white">
            <div className="flex items-center gap-2">
              <FiBriefcase className="text-[#10b981]" />{' '}
              <span>Keila Operator</span>
            </div>
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <button
                onClick={() => logout()}
                className="text-white hover:text-red-400"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
  {isLoadingThreads ? (
    <div className="flex flex-col gap-2 p-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-full h-16 bg-gray-800 animate-pulse rounded-lg" />
      ))}
    </div>
  ) : activeThreads.length > 0 ? (
    activeThreads.map((thread) => (
      <button
        key={thread.sessionId}
        onClick={() => setSelectedSessionId(thread.sessionId)}
        className={`w-full text-left p-3 rounded-lg cursor-pointer ${
          thread.sessionId === selectedSessionId 
            ? 'bg-[#2563eb] text-white' 
            : 'bg-gray-800 hover:bg-[#222]'
        }`}
      >
        <div className="text-sm font-medium truncate">
          Session: ...{thread.sessionId.slice(-6)}
        </div>
        <div className="text-xs text-slate-300 truncate mt-1">
          {thread.lastMessageText}
        </div>
      </button>
    ))
  ) : (
    // Show empty state
    <div className="flex flex-col items-center justify-center h-full text-white text-sm p-4">
      <p>No active sessions</p>
    </div>
  )}
</div>
        </div>
      </div>

      {/* CORE ACTIVE CONVERSATION WORKSPACE */}

      <div
        className={`flex-1 flex flex-col bg-background ${selectedSessionId ? 'flex' : 'hidden md:flex'}`}
      >
        {selectedSessionId ? (
          <>
            <div className="p-4 border-b border-border bg-background flex items-center gap-3">
              <button
                onClick={() => setSelectedSessionId(null)}
                className="md:hidden p-2 rounded-full text-foreground transition-colors active:scale-95"
                aria-label="Back to conversations"
              >
                <FiArrowLeft size={20} />
              </button>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-foreground">
                  Active Thread
                </h2>
                {isVisitorTyping && (
                  <p className="text-[10px] text-[#10b981] animate-pulse italic">
                    Visitor is typing...
                  </p>
                )}
              </div>
              <button
                onClick={handleEndSession}
                className="text-[10px] bg-red-900/20 text-red-400 border border-red-900/50 px-2 py-1 rounded cursor-pointer"
              >
                End Session
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(() => {
                // 1. Grouping
                const groups: Record<string, MessagePayload[]> = {}
                messages.forEach((msg) => {
                  const dateKey = getGroupDate(msg.createdAt)
                  if (!groups[dateKey]) groups[dateKey] = []
                  groups[dateKey].push(msg)
                })

                // 2. Rendering
                return Object.entries(groups).map(
                  ([dateLabel, groupMessages]) => (
                    <div key={dateLabel} className="flex flex-col gap-3">
                      {/* Date Divider */}
                      <div className="text-center text-[10px] text-foreground font-medium uppercase tracking-wider my-2">
                        {dateLabel}
                      </div>

                      {groupMessages.map((msg, idx) => {
                        const isOp = msg.senderType === 'operator'
                        const time = new Date(
                          msg.createdAt || new Date(),
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        return (
                          // <div
                          //   key={msg._id || idx}
                          //   className={`flex flex-col ${isOp ? 'items-end' : 'items-start'}`}
                          // >
                          //   <div
                          //     className={`p-3 rounded-xl max-w-[70%] text-sm shadow-sm ${
                          //       isOp
                          //         ? 'bg-[#10b981] text-white'
                          //         : 'bg-[#333] text-zinc-100 dark:text-white'
                          //     }`}
                          //   >
                          //     {msg.messageText}
                          //   </div>
                          //   <span className="text-[10px] text-black dark:text-white mt-1 px-1">
                          //     {isOp ? 'You' : msg.senderName || 'Visitor'} •{' '}
                          //     {time}
                          //   </span>
                          // </div>

                          <div
                            key={msg._id || idx}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isOp ? 'flex-end' : 'flex-start',
                            }}
                          >
                            <div
                              style={{
                                padding: '0.6rem 0.9rem',
                                borderRadius: isOp
                                  ? '12px 12px 0 12px'
                                  : '12px 12px 12px 0',
                                maxWidth: '80%',
                                backgroundColor: isOp ? '#10b981' : '#333',
                                color: '#fff',
                              }}
                              className="text-xs! md:text-sm"
                            >
                              {msg.messageText}
                            </div>
                            <span
                              style={{
                                fontSize: '0.65rem',
                                color: '#666',
                                marginTop: '2px',
                                paddingLeft: '4px',
                              }}
                            >
                              {time}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ),
                )
              })()}
              {isVisitorTyping && <TypingIndicator />}
              <div ref={feedEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-card flex gap-2">
            
              <input
                disabled={isSessionClosed}
                value={operatorInput}
                placeholder="Reply to this chat..."
                onChange={(e) => {
                  setOperatorInput(e.target.value)
                  // 1. Send "isTyping: true" on first keystroke
                  sendTypingStatus(true)
                  // 2. Clear existing timer
                  if (typingTimerRef.current)
                    clearTimeout(typingTimerRef.current)
                  // 3. Set timer to stop typing indicator after 2 seconds of inactivity
                  typingTimerRef.current = setTimeout(() => {
                    sendTypingStatus(false)
                  }, 2000)
                }}
                className="flex-1 bg-background border border-border text-foreground outline-none focus:border-primary rounded-lg px-4 py-2.5 text-sm!"
              />
              <button
                onClick={sendResponse}
                disabled={isSessionClosed}
                className="bg-[#10b981] text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
              >
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-foreground text-sm">
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
