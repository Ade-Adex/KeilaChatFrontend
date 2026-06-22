// /app/components/chat/ChatWindow.tsx

'use client'

import ThemeToggle from '@/app/components/ThemeToggle'
import { useAuthStore } from '@/app/store/useAuthStore'
import { ActionIcon, Button, Menu, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'
import { FiSend, FiX } from 'react-icons/fi'
import { IoMenuSharp } from 'react-icons/io5'
import { io, Socket } from 'socket.io-client'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
  status: string
}


declare global {
  interface Window {
    KeilaConfig?: {
      widgetId?: string
    }
  }
}



interface PresenceNotificationPayload {
  _id: string
  sessionId: string
  senderType: 'system'
  senderId: string
  messageText: string
  createdAt: string | Date
  isRead: boolean
}

interface ChatWindowProps {
  onClose: () => void
  widgetId: string
  originWebsite: string
}

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

export default function ChatWindow({
  onClose,
  widgetId,
  originWebsite,
}: ChatWindowProps) {
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

  const [visitorInput, setVisitorInput] = useState('')
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isOperatorTyping, setIsOperatorTyping] = useState(false)

  const isSessionClosed = config?.status === 'closed'
  const [opened, { open, close }] = useDisclosure(false)

  const authUser = useAuthStore((state) => state.user)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Automatically extracts the latest operator name present in the logs
  const operatorName = messages
    .filter((m) => m.senderType === 'operator')
    .pop()?.senderName

  // --- 1. Identity & Session Initialization ---
  useEffect(() => {
    const initSession = async () => {
      const { _hasHydrated } = useAuthStore.getState()
      if (!_hasHydrated) return

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
            body: JSON.stringify({
              widgetId,
              visitorId,
              originWebsite,
            }),
            signal: controller.signal,
          },
        )

        const resData = await response.json()

        if (resData.status === 'success' && resData.data.session) {
          setConfig({
            propertyId: resData.data.session.propertyId,
            sessionId: resData.data.session._id,
            visitorId: visitorId,
            status: resData.data.session.status,
          })
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.name !== 'AbortError')
            console.error('Session Init Error:', err.message)
        }
      }
    }

    initSession()
  }, [authUser, widgetId, originWebsite])

  // --- 2. Socket Connection & Message Sync ---
  useEffect(() => {
    if (!config?.sessionId) return

    fetch(`${BACKEND_URL}/api/v1/sessions/${config.sessionId}/messages`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 'success')
          setMessages(resData.data.messages || [])
      })

    const socketInstance = io(BACKEND_URL, {
      auth: { token: authUser?.accessToken || null },
    })

    socketRef.current = socketInstance

    // socketInstance.on('connect', () => {
    //   socketInstance.emit('join_chat_session', {
    //     sessionId: config.sessionId,
    //     propertyId: config.propertyId,
    //     clientType: 'visitor',
    //     senderName: visitorName,
    //   })
    // })

    socketInstance.on('connect', () => {
      socketInstance.emit('join_chat_session', {
        sessionId: config.sessionId,
        clientType: 'visitor',
        senderName: visitorName,
      })
    })

    socketInstance.on('new_message', (payload: MessagePayload) => {
      setMessages((prev) =>
        prev.some((m) => m._id === payload._id) ? prev : [...prev, payload],
      )
    })

    // Catch real-time join events from agents and append them straight to the timeline log

    socketInstance.on(
      'presence_notification',
      (payload: PresenceNotificationPayload) => {
        const systemPayload: MessagePayload = {
          _id: payload._id,
          sessionId: payload.sessionId,
          senderType: 'system',
          senderId: 'system',
          messageText: payload.messageText,
          createdAt:
            typeof payload.createdAt === 'string'
              ? payload.createdAt
              : payload.createdAt.toISOString(),
        }

        setMessages((prev) =>
          prev.some((m) => m._id === systemPayload._id)
            ? prev
            : [...prev, systemPayload],
        )
      },
    )

    socketInstance.on('session_closed', () => {
      setConfig((prev) => (prev ? { ...prev, status: 'closed' } : null))
    })

    // socketInstance.on('user_typing', (p: { isTyping: boolean }) =>
    //   setIsOperatorTyping(p.isTyping),
    // )

    socketInstance.on(
      'user_typing',
      (payload: { senderName: string; isTyping: boolean }) => {
        setIsOperatorTyping(payload.isTyping)
      },
    )

    return () => {
      socketInstance.disconnect()
    }
  }, [
    config?.sessionId,
    config?.propertyId,
    authUser?.accessToken,
    visitorName,
  ])

  // --- 3. Professional Auto-Scrolling Pipeline ---
  useEffect(() => {
    // Use 'auto' for the initial fetch load, and 'smooth' for real-time messages
    const behavior = messages.length <= 20 ? 'auto' : 'smooth'

    // Wrap in a micro-task timeout to ensure the DOM has finished rendering the
    // newest elements (like new bubbles or the typing indicator) before calculating position
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior })
    }, 50)

    return () => clearTimeout(timer)
  }, [messages, isOperatorTyping])

  const sendTypingStatus = (isTyping: boolean) => {
    if (!socketRef.current || !config) return
    socketRef.current.emit('typing', {
      sessionId: config.sessionId,
      senderName: visitorName,
      isTyping,
    })
  }


  const handleTextareaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisitorInput(e.target.value)

    // Send typing event status true instantly
    sendTypingStatus(true)

    // Debounce: reset status to false after 2 seconds of silence
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      sendTypingStatus(false)
    }, 2000)
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
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 30)
  }

  const handleEndSession = async () => {
    if (!config?.sessionId) return
    try {
      await fetch(`${BACKEND_URL}/api/v1/sessions/${config.sessionId}/end`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endedBy: 'visitor' }),
      })
      close()
    } catch (err) {
      console.error('Failed to end session', err)
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-transparent dark:bg-transparent overflow-hidden shadow-2xl">
      <Modal
        opened={opened}
        onClose={close}
        title="End Chat Session"
        centered
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <p>
          Are you sure you want to end this chat session? This action cannot be
          undone.
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleEndSession}>
            End Session
          </Button>
        </div>
      </Modal>

      <div
        style={{
          position: 'fixed',
          top: isMobile ? '0' : '0.5rem',
          left: isMobile ? '0' : 'auto',
          bottom: isMobile ? '0' : '1.5rem',
          right: isMobile ? '0' : '0rem',
          width: isMobile ? '100vw' : '340px',
          height: isMobile ? '100dvh' : 'calc(100vh - 1rem)',
          background: 'transparent',
          borderRadius: isMobile ? '0' : '0px 12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
          <div>
            <div className="font-bold">Live Support</div>
            <div className="text-xs opacity-80">We are online</div>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Menu
              shadow="md"
              width={200}
              withinPortal={false}
              position="bottom-end"
            >
              <Menu.Target>
                <ActionIcon variant="transparent" color="white" size="lg">
                  <IoMenuSharp />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => setIsEditingName(true)}>
                  Change Name
                </Menu.Item>
                <Menu.Item color="red" onClick={open}>
                  End Session
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
            <button onClick={onClose}>
              <FiX size={20} />
            </button>
          </div>
        </div>

        {isEditingName && (
          <div
            style={{
              position: 'absolute',
              top: '4rem',
              left: '1rem',
              right: '1rem',
              borderRadius: '8px',
              border: '1px solid #333',
              zIndex: 20,
            }}
            className="bg-card py-8 px-4"
          >
            <input
              autoFocus
              placeholder="Enter your name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="w-full bg-background border border-border text-foreground outline-none focus:border-primary rounded-lg px-4 py-2.5 text-sm!"
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
                className="flex-1 py-2 rounded-lg bg-primary hover:bg-button-hover text-white font-medium transition-colors text-center text-sm cursor-pointer"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="flex-1 py-2 rounded-lg bg-[#333] text-white font-medium transition-colors text-center text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Operator Status Bar */}
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

        {/* Messages Body Container */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-background">
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

            return Object.entries(groups).map(([dateLabel, groupMessages]) => (
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
                  const isSystem = msg.senderType === 'system'
                  const isMe = msg.senderType === 'visitor'
                  const time = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })

                  // Render explicit system join notices centered down the stream layout timeline
                  if (isSystem) {
                    return (
                      <div
                        key={msg._id || idx}
                        style={{
                          alignSelf: 'center',
                          textAlign: 'center',
                          margin: '0.25rem 0',
                          padding: '0.4rem 1rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px dashed rgba(16, 185, 129, 0.3)',
                          borderRadius: '20px',
                          color: '#10b981',
                          fontSize: '0.72rem',
                          maxWidth: '90%',
                        }}
                      >
                        {msg.messageText}
                      </div>
                    )
                  }

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
                          backgroundColor: isMe ? '#0070f3' : '#333',
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
            ))
          })()}
          {isOperatorTyping && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        {/* Footer Section */}
        <div className="border-t border-border bg-card p-3 shrink-0">
          {isSessionClosed ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1rem',
                color: '#666',
                fontSize: '0.8rem',
                fontStyle: 'italic',
              }}
            >
              This chat session has ended.
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: '0.4rem',
                  alignItems: 'center',
                }}
                className="border-t border-border bg-card px-6 py-2"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={visitorInput}
                  // onChange={(e) => {
                  //   setVisitorInput(e.target.value)
                  //   sendTypingStatus(true)
                  //   if (typingTimerRef.current)
                  //     clearTimeout(typingTimerRef.current)
                  //   typingTimerRef.current = setTimeout(
                  //     () => sendTypingStatus(false),
                  //     2000,
                  //   )
                  // }}

                  onChange={handleTextareaChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  style={{
                    flex: 1,
                    borderRadius: '18px',
                  }}
                  className=" bg-background border border-border text-foreground outline-none focus:border-primary text-xs! md:text-sm px-4 py-2.5"
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
            </>
          )}

          <div
            style={{
              padding: '0 0.6rem 0.6rem 0.6rem',
              textAlign: 'center',
              fontSize: '0.65rem',
            }}
            className="text-foreground"
          >
            Powered by <strong>Keila Technologies</strong>
          </div>
        </div>
      </div>
    </div>
  )
}