// /app(routes)/chat-test/embed/chat/page.tsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi'
import { useAuthStore } from '@/app/store/useAuthStore'
import { IoMenuSharp } from 'react-icons/io5'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

interface MessagePayload {
  _id?: string
  sessionId: string
  senderType: 'visitor' | 'operator' | 'system'
  senderId: string
  senderName?: string
  messageText: string
  createdAt: string
}

interface ConfigData {
  propertyId: string
  sessionId: string
  visitorId: string
}

interface MessagesSyncResponse {
  status: string
  data: {
    messages: MessagePayload[]
  }
}

interface SocketAck {
  error?: string
  status?: string
}

declare global {
  interface Window {
    KeilaConfig?: {
      widgetId?: string 
    }
  }
}

  // Add this interface
  interface MenuItem {
    label: string
    action: () => void
  }

// --- HELPER FUNCTION: Define it outside the component ---
const getGroupDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}


 const TypingIndicator = () => (
   <div
     style={{
       display: 'flex',
       gap: '4px',
       padding: '10px 14px',
       backgroundColor: '#333',
       borderRadius: '12px 12px 12px 0',
       width: 'fit-content',
       alignSelf: 'flex-start',
     }}
   >
     {[0, 1, 2].map((i) => (
       <div
         key={i}
         style={{
           width: '6px',
           height: '6px',
           backgroundColor: '#888',
           borderRadius: '50%',
           animation: 'bounce 1.4s infinite ease-in-out both',
           animationDelay: `${i * 0.16}s`,
         }}
       />
     ))}
     <style jsx>{`
       @keyframes bounce {
         0%,
         80%,
         100% {
           transform: scale(0);
         }
         40% {
           transform: scale(1);
         }
       }
     `}</style>
   </div>
 )


export default function StandaloneEmbedWidget() {
  const socketRef = useRef<Socket | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [visitorName, setVisitorName] = useState(() =>
    typeof window !== 'undefined'
      ? localStorage.getItem('keila_visitor_name') || 'Visitor'
      : 'Visitor',
  )
  const [isEditingName, setIsEditingName] = useState(false)
  const [tempName, setTempName] = useState('')

  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [visitorInput, setVisitorInput] = useState('')
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isOperatorTyping, setIsOperatorTyping] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  // Inside StandaloneEmbedWidget component
  const [isMenuOpen, setIsMenuOpen] = useState(false)


  const authUser = useAuthStore((state) => state.user)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const operatorName = messages
    .filter((m) => m.senderType === 'operator')
    .pop()?.senderName

  // --- 1. Identity & Session Initialization ---
  useEffect(() => {
    const initSession = async () => {
      const { _hasHydrated } = useAuthStore.getState()

      if (!_hasHydrated) return

      const hostConfig = window.KeilaConfig
      const params = new URLSearchParams(window.location.search)

      // Prioritize the script-injected ID, fallback to URL search params
      // const widgetId = hostConfig?.widgetId || params.get('widgetId')

      const TEST_WIDGET_ID = 'b9a5cea7-ec8b-4cb6-9c62-521e5fd8f195'

      // Prioritize hardcoded ID -> script-injected ID -> URL search params
      const widgetId =
        TEST_WIDGET_ID || hostConfig?.widgetId || params.get('widgetId')

      if (!widgetId) {
        console.warn('KeilaChat: No Widget ID found.')
        queueMicrotask(() => setIsLoading(false))
        return
      }

      // Use widgetId for persistent storage tracking
      const visitorId =
        authUser?.id ||
        localStorage.getItem(`keila_visitor_${widgetId}`) ||
        crypto.randomUUID()

      if (!authUser) {
        localStorage.setItem(`keila_visitor_${widgetId}`, visitorId)
      }

      const controller = new AbortController()

      try {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/sessions/initiate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ widgetId, visitorId }),
            signal: controller.signal,
          },
        )

        const resData = await response.json()

        // Update config with the internal propertyId returned by the backend
        if (resData.status === 'success' && resData.data.session) {
          setConfig({
            propertyId: resData.data.session.propertyId,
            sessionId: resData.data.session._id,
            visitorId: visitorId,
          })
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError')
            console.error('Session Init Error:', err.message)
        } else {
          console.error(
            'An unexpected error occurred during session initiation',
          )
        }
      } finally {
        queueMicrotask(() => setIsLoading(false))
      }
    }

    initSession()
  }, [authUser])

  // --- 2. Socket Connection & Message Sync ---
  useEffect(() => {
    if (!config?.sessionId) return

    // Fetch message history
    fetch(`${BACKEND_URL}/api/v1/sessions/${config.sessionId}/messages`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 'success')
          setMessages(resData.data.messages || [])
      })

    // Initialize Socket with Auth token if available
    const socketInstance = io(BACKEND_URL, {
      auth: { token: authUser?.accessToken || null },
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      socketInstance.emit('join_chat_session', { sessionId: config.sessionId })
    })

    socketInstance.on('new_message', (payload: MessagePayload) => {
      setMessages((prev) =>
        prev.some((m) => m._id === payload._id) ? prev : [...prev, payload],
      )
    })

    socketInstance.on('user_typing', (p: { isTyping: boolean }) =>
      setIsOperatorTyping(p.isTyping),
    )

    return () => {
      socketInstance.disconnect()
    }
  }, [config?.sessionId, authUser?.accessToken])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isWidgetOpen, isOperatorTyping])

  const sendTypingStatus = (isTyping: boolean) => {
    if (!socketRef.current || !config) return
    socketRef.current.emit('typing', {
      sessionId: config.sessionId,
      senderName: 'Visitor',
      isTyping,
    })
  }

  const handleSend = () => {
    if (!socketRef.current || !visitorInput.trim() || !config) return
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    sendTypingStatus(false)
    socketRef.current.emit('send_message', {
      sessionId: config.sessionId,
      propertyId: config.propertyId,
      senderType: 'visitor',
      senderName: visitorName,
      senderId: config.visitorId,
      messageText: visitorInput,
      createdAt: new Date().toISOString(),
    })
    setVisitorInput('')
  }

  const handleEndSession = async () => {
    if (!config?.sessionId) return

    try {
      await fetch(`${BACKEND_URL}/api/v1/sessions/${config.sessionId}/end`, {
        method: 'PATCH',
      })
      // Clear local state or close widget
      setMessages([])
      setIsWidgetOpen(false)
      setIsMenuOpen(false)
      // Optional: Force re-init or clear session cache
      window.location.reload()
    } catch (err) {
      console.error('Failed to end session', err)
    }
  }


  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 999999,
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {isWidgetOpen && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '0' : '0.5rem',
            left: isMobile ? '0' : 'auto',
            bottom: isMobile ? '0' : '1.5rem',
            right: isMobile ? '0' : '0rem',
            width: isMobile ? '100vw' : '340px',
            height: isMobile ? '100dvh' : 'calc(100vh - 1rem)',
            backgroundColor: '#111',
            borderRadius: isMobile ? '0' : '0px 12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: '#0070f3',
              padding: '1rem',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>Live Support</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                We are online
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {/* Dropdown Trigger */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <IoMenuSharp />
              </button>
              <button
                onClick={() => setIsWidgetOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '3.5rem',
                  right: '0.5rem',
                  backgroundColor: '#222',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  zIndex: 10,
                  width: '150px',
                }}
              >
                <div
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setIsEditingName(true)
                    setIsMenuOpen(false)
                  }}
                >
                  Change Name
                </div>
                <div
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    borderTop: '1px solid #333',
                    color: '#ff4d4d',
                  }}
                  onClick={() => {
                    if (confirm('Are you sure you want to end this chat?')) {
                      handleEndSession()
                    }
                  }}
                >
                  End Chat Session
                </div>
              </div>
            )}
          </div>

          {isEditingName && (
            <div
              style={{
                position: 'absolute',
                top: '4rem',
                left: '1rem',
                right: '1rem',
                backgroundColor: '#1a1a1a',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #333',
                zIndex: 20,
              }}
            >
              <input
                autoFocus
                placeholder="Enter your name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#000',
                  color: '#fff',
                }}
              />
              <div
                style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}
              >
                <button
                  onClick={() => {
                    setVisitorName(tempName)
                    localStorage.setItem('keila_visitor_name', tempName)
                    setIsEditingName(false)
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#0070f3',
                    border: 'none',
                    color: '#fff',
                    padding: '0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#333',
                    border: 'none',
                    color: '#fff',
                    padding: '0.5rem',
                    borderRadius: '4px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Fixed Operator Bar */}
          {operatorName && (
            <div
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #222',
                fontSize: '0.75rem',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              Chatting with <strong>{operatorName}</strong>
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              backgroundColor: '#050505',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
            }}
          >
            <div
              style={{
                alignSelf: 'flex-start',
                padding: '0.6rem 0.9rem',
                borderRadius: '12px 12px 12px 0',
                backgroundColor: '#333',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              Hi! How can we help you today?
            </div>
            {(() => {
              const groups: Record<string, MessagePayload[]> = {}
              messages.forEach((msg) => {
                const dateKey = getGroupDate(msg.createdAt)
                if (!groups[dateKey]) groups[dateKey] = []
                groups[dateKey].push(msg)
              })

              return Object.entries(groups).map(
                ([dateLabel, groupMessages]) => (
                  <div
                    key={dateLabel}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.8rem',
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        color: '#666',
                        margin: '0.5rem 0',
                      }}
                    >
                      {dateLabel}
                    </div>
                    {groupMessages.map((msg, idx) => {
                      const isMe = msg.senderType === 'visitor'
                      const time = new Date(msg.createdAt).toLocaleTimeString(
                        [],
                        { hour: '2-digit', minute: '2-digit' },
                      )

                      return (
                        <div
                          key={msg._id || idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              padding: '0.6rem 0.9rem',
                              borderRadius: isMe
                                ? '12px 12px 0 12px'
                                : '12px 12px 12px 0',
                              maxWidth: '80%',
                              fontSize: '0.85rem',
                              backgroundColor: isMe ? '#0070f3' : '#333',
                              color: '#fff',
                            }}
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
            {isOperatorTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>


          {/* Footer Section */}
          <div
            style={{
              borderTop: '1px solid #222',
              backgroundColor: '#111',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : '0',
            }}
          >
            {/* Input Row */}
            <div
              style={{
                padding: '0.6rem',
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={visitorInput}
                onChange={(e) => {
                  setVisitorInput(e.target.value)
                  sendTypingStatus(true)
                  if (typingTimerRef.current)
                    clearTimeout(typingTimerRef.current)
                  typingTimerRef.current = setTimeout(
                    () => sendTypingStatus(false),
                    2000,
                  )
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '18px',
                  border: '1px solid #333',
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  outline: 'none',
                }}
              />
              {visitorInput && (
                <button
                  onClick={handleSend}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#0070f3',
                    border: 'none',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  <FiSend />
                </button>
              )}
            </div>

            {/* Powered By Branding */}
            <div
              style={{
                padding: '0 0.6rem 0.6rem 0.6rem',
                textAlign: 'center',
                fontSize: '0.65rem',
                color: '#444',
              }}
            >
              Powered by <strong>Keila Technologies</strong>
            </div>
          </div>
        </div>
      )}

      {/* Hide trigger button when open */}
      {!isWidgetOpen && (
        <button
          onClick={() => setIsWidgetOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
          }}
        >
          <FiMessageSquare />
        </button>
      )}
    </div>
  )
}
