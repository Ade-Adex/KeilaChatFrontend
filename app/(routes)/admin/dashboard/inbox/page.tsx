//  /app/(routes)/admin/dashboard/page.tsx



'use client'

import TypingIndicator from '@/app/components/TypingIndicator'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FiArrowLeft, FiBriefcase, FiSend } from 'react-icons/fi'
import { io, Socket } from 'socket.io-client'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL

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

export default function AdminInboxPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
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

  // Pipeline 1: Property Dashboard Management Room
  useEffect(() => {
    if (!user || !user.property?.id) return

    const propertyId = user.property.id
    const socketInstance = io(BACKEND_URL, {
      auth: { token: user.accessToken },
    })
    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      socketInstance.emit('join_property_dashboard', { propertyId })
    })

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

    currentSocket.emit('join_chat_session', {
      sessionId: selectedSessionId,
      clientType: 'operator',
      senderName: user.name,
    })

    fetch(
      `${BACKEND_URL}/api/v1/sessions/${selectedSessionId}/messages?propertyId=${user.property?.id}`,
      {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      },
    )
      .then((res) => res.json())
      .then((resData: HistoryResponse) => {
        if (resData.status === 'success') {
          setMessages(resData.data.messages || [])
        }
      })
      .catch((err) => console.error('History integration break:', err))

    currentSocket.on('presence_notification', (payload: MessagePayload) => {
      if (payload.sessionId === selectedSessionId) {
        setMessages((prev) => [...prev, payload])
      }
    })

    // currentSocket.on(
    //   'user_typing',
    //   (payload: { senderName: string; isTyping: boolean }) => {
    //     setIsVisitorTyping(payload.isTyping)
    //   },
    // )

    currentSocket.on(
      'user_typing',
      (payload: {
        senderName: string
        senderType: 'visitor' | 'operator'
        isTyping: boolean
      }) => {
        if (payload.senderType === 'visitor') {
          setIsVisitorTyping(payload.isTyping)
        }
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
      currentSocket.off('presence_notification')
    }
  }, [selectedSessionId, user])

  // Professional Auto-Scrolling Hook Matrix
  useEffect(() => {
    // If the window has few messages (initial route loading), snap immediately without a transition look.
    // If it's a dynamic live conversation push, make it scroll smoothly.
    const scrollBehavior = messages.length <= 30 ? 'auto' : 'smooth'

    const executionTimer = setTimeout(() => {
      feedEndRef.current?.scrollIntoView({ behavior: scrollBehavior })
    }, 40)

    return () => clearTimeout(executionTimer)
  }, [messages, isVisitorTyping, selectedSessionId])

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

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    sendTypingStatus(false)

    socketRef.current.emit('send_message', {
      sessionId: selectedSessionId,
      propertyId: user?.property?.id,
      senderType: 'operator',
      senderId: user.id,
      senderName: user.name,
      messageText: operatorInput,
    })
    setOperatorInput('')

    // Micro snap directly downwards on layout registration
    setTimeout(() => {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 20)
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
        setSelectedSessionId(null)
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
    <div className="flex h-[calc(100vh-60px-var(--mantine-spacing-md)*2)] w-full bg-background text-foreground font-sans select-none overflow-hidden rounded-xl border border-border shadow-sm">
      {/* SIDEBAR ACTIVE QUEUE COLUMN */}
      <div
        className={`w-full md:w-85 border-r border-border flex flex-col justify-between ${selectedSessionId ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-background">
            <h3 className="text-sm font-semibold tracking-tight">
              Live Conversations
            </h3>
            <span className="text-[11px] bg-blue-500/10 text-primary font-medium px-2 py-0.5 rounded-full">
              {activeThreads.filter((t) => t.status !== 'closed').length} active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
            {isLoadingThreads ? (
              <div className="flex flex-col gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-full p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-xl space-y-2 animate-pulse"
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
                      <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
                    </div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : activeThreads.length > 0 ? (
              activeThreads.map((thread) => {
                const isSelected = thread.sessionId === selectedSessionId
                const shortId = thread.sessionId.slice(-6).toUpperCase()

                return (
                  <button
                    key={thread.sessionId}
                    onClick={() => setSelectedSessionId(thread.sessionId)}
                    className={`group w-full text-left p-3.5 rounded-xl cursor-pointer transition-all duration-200 flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-primary text-white border-border shadow-md shadow-neutral-900/10 dark:shadow-none'
                        : 'bg-background border-border hover:bg-button-hover'
                    }`}
                  >
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${isSelected ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-200 dark:text-neutral-800' : 'bg-button-hover group-hover:bg-background'}`}
                    >
                      {shortId.slice(0, 2)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-sm font-semibold truncate">
                          Visitor #{shortId}
                        </span>
                        <span
                          className={`text-[10px] ${isSelected ? 'opacity-80' : 'text-foreground'}`}
                        >
                          {new Date(thread.updatedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p
                        className={`text-xs truncate ${isSelected ? 'opacity-90' : 'text-foreground'}`}
                      >
                        {thread.lastMessageText}
                      </p>
                      {thread.status === 'closed' && (
                        <span className="inline-block mt-1.5 text-[9px] uppercase tracking-wider font-bold bg-button-hover px-1.5 py-0.5 rounded">
                          Archived
                        </span>
                      )}
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-3">
                  <FiBriefcase size={20} />
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Inbox is pristine
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  No incoming support sessions matching your property queue
                  routing context.
                </p>
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
            <div className="p-4 border-b border-border flex items-center justify-between gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSelectedSessionId(null)}
                  className="md:hidden p-2 -ml-2 rounded-full text-foreground transition-colors active:scale-95"
                  aria-label="Back to conversations"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold tracking-tight truncate flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Thread: ...{selectedSessionId.slice(-6).toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-neutral-400 font-mono truncate">
                      ID: {selectedSessionId}
                    </span>
                    {isVisitorTyping && (
                      <span className="text-[10px] text-emerald-500 font-medium italic flex items-center gap-1">
                        <span className="animate-bounce">·</span>
                        <span className="animate-bounce [animation-delay:0.2s]">
                          ·
                        </span>
                        <span className="animate-bounce [animation-delay:0.4s]">
                          ·
                        </span>
                        visitor typing
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleEndSession}
                className="text-xs! font-semibold bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-lg cursor-pointer transition-colors shrink-0"
              >
                End Session
              </button>
            </div>

            {/* CHAT MESSAGES DISPLAY FIELD */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {(() => {
                const groups: Record<string, MessagePayload[]> = {}
                messages.forEach((msg) => {
                  const dateKey = getGroupDate(msg.createdAt)
                  if (!groups[dateKey]) groups[dateKey] = []
                  groups[dateKey].push(msg)
                })

                return Object.entries(groups).map(
                  ([dateLabel, groupMessages]) => (
                    <div key={dateLabel} className="flex flex-col gap-4">
                      <div className="flex items-center justify-center my-2">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-[10px] text-foreground font-semibold uppercase tracking-widest px-3">
                          {dateLabel}
                        </span>
                        <div className="h-px bg-border flex-1" />
                      </div>

                      {groupMessages.map((msg, idx) => {
                        const isOp = msg.senderType === 'operator'
                        const isSys = msg.senderType === 'system'
                        const time = new Date(
                          msg.createdAt || new Date(),
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })

                        if (isSys) {
                          return (
                            <div
                              key={msg._id || idx}
                              className="flex items-center justify-center w-full my-1"
                            >
                              <span className="text-[11px] bg-neutral-100 dark:bg-neutral-800 border border-border text-zinc-400 font-medium px-3 py-1 rounded-full text-center max-w-[85%]">
                                {msg.messageText}
                              </span>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={msg._id || idx}
                            className={`flex flex-col group ${isOp ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`flex items-baseline gap-2 mb-1 text-[11px] text-foreground ${isOp ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                              <span className="font-medium text-foreground">
                                {isOp ? 'You' : msg.senderName || 'Visitor'}
                              </span>
                              <span className="opacity-70 text-[9px]">
                                {time}
                              </span>
                            </div>

                            <div
                              className={`px-4 py-2.5 text-sm max-w-[70%] shadow-sm leading-relaxed ${
                                isOp
                                  ? 'rounded-2xl rounded-tr-none text-white bg-neutral-600 dark:bg-neutral-700'
                                  : 'text-zinc-800 dark:text-zinc-100 bg-neutral-100 dark:bg-neutral-800 rounded-2xl rounded-tl-none border border-border'
                              }`}
                            >
                              <p className="whitespace-pre-wrap wrap-break-word">
                                {msg.messageText}
                              </p>
                            </div>
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

            {/* MESSAGE CONTROL INPUT BLOCK */}
            <div className="py-2 px-4 border-t border-border bg-card">
              <div className="flex items-center gap-2 rounded-xl transition-colors">
                <input
                  disabled={isSessionClosed}
                  value={operatorInput}
                  placeholder={
                    isSessionClosed
                      ? 'This conversation has been closed and archived...'
                      : 'Type your secure reply here...'
                  }
                  onChange={(e) => {
                    setOperatorInput(e.target.value)
                    sendTypingStatus(true)
                    if (typingTimerRef.current)
                      clearTimeout(typingTimerRef.current)
                    typingTimerRef.current = setTimeout(() => {
                      sendTypingStatus(false)
                    }, 2000)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendResponse()
                    }
                  }}
                  className="flex-1 bg-background border border-border text-foreground outline-none focus:border-primary rounded-lg px-4 py-2.5 text-sm!"
                />
                <button
                  onClick={sendResponse}
                  disabled={isSessionClosed || !operatorInput.trim()}
                  className="bg-[#10b981] text-white py-2.5 px-4 rounded-lg text-sm cursor-pointer hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-neutral-50/20 dark:bg-neutral-950/5 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 dark:text-neutral-500 mb-4 animate-pulse">
              <FiSend size={24} />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              No Thread Selected
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs mt-1.5 leading-relaxed">
              Select a running operator pipeline room from the left dashboard
              routing grid columns matrix to interact.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}