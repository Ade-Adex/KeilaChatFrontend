// /app(routes)/chat-test/embed/chat/page.tsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { FiX, FiSend, FiMessageSquare } from 'react-icons/fi'

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

export default function StandaloneEmbedWidget() {
  const socketRef = useRef<Socket | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [visitorInput, setVisitorInput] = useState('')
  const [messages, setMessages] = useState<MessagePayload[]>([])
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(true)

  const [isOperatorTyping, setIsOperatorTyping] = useState(false)

  // Derived: Get the operator name from the most recent operator message
  const operatorName = messages
    .filter((m) => m.senderType === 'operator')
    .pop()?.senderName

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const propertyId = params.get('propertyId') || '6a3143b6d4767cbc5b60ac7c'

    let storedVisitorId = localStorage.getItem(`keila_visitor_${propertyId}`)
    if (!storedVisitorId) {
      storedVisitorId = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')
      localStorage.setItem(`keila_visitor_${propertyId}`, storedVisitorId)
    }

    fetch(`${BACKEND_URL}/api/v1/sessions/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId, visitorId: storedVisitorId }),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.status === 'success' && resData.data.session) {
          setConfig({
            propertyId: resData.data.session.propertyId,
            sessionId: resData.data.session._id || resData.data.session.id,
            visitorId: storedVisitorId!,
          })
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!config?.sessionId) return

    fetch(`${BACKEND_URL}/api/v1/sessions/${config.sessionId}/messages`)
      .then((res) => res.json())
      .then((resData: MessagesSyncResponse) => {
        if (resData.status === 'success')
          setMessages(resData.data.messages || [])
      })

    const socketInstance = io(BACKEND_URL)
    socketRef.current = socketInstance
    socketInstance.on('connect', () =>
      socketInstance.emit('join_chat_session', { sessionId: config.sessionId }),
    )

    socketInstance.on('new_message', (payload: MessagePayload) => {
      if (payload.sessionId === config.sessionId) {
        setMessages((prev) =>
          payload._id && prev.some((m) => m._id === payload._id)
            ? prev
            : [...prev, payload],
        )
      }
    })

    socketInstance.on(
      'user_typing',
      (payload: { senderName: string; isTyping: boolean }) => {
        setIsOperatorTyping(payload.isTyping)
      },
    )

    return () => {
      socketInstance.disconnect()
    }
  }, [config])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isWidgetOpen])

  // Helper for sending typing status
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

   // Clear timer and stop typing signal when sending
   if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
   sendTypingStatus(false)

   socketRef.current.emit('send_message', {
     sessionId: config.sessionId,
     propertyId: config.propertyId,
     senderType: 'visitor',
     senderId: config.visitorId,
     messageText: visitorInput,
     createdAt: new Date().toISOString(),
   })
   setVisitorInput('')
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
            position: 'absolute',
            bottom: '4.5rem',
            right: 0,
            width: '340px',
            height: '480px',
            backgroundColor: '#111',
            border: '1px solid #222',
            borderRadius: '12px',
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
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                Live Support
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                We are online
              </div>
            </div>
            <button
              onClick={() => setIsWidgetOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              <FiX />
            </button>
          </div>

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
            {messages.map((msg, idx) => {
              const isMe = msg.senderType === 'visitor'
              const time = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
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
            <div ref={chatEndRef} />
          </div>

          {/* INSERT TYPING INDICATOR HERE */}
          {isOperatorTyping && (
            <div
              style={{
                padding: '0.2rem 1rem',
                fontSize: '0.65rem',
                color: '#10b981',
                fontStyle: 'italic',
                backgroundColor: '#111',
              }}
            >
              {operatorName || 'Operator'} is typing...
            </div>
          )}

          {/* Footer Input */}
          <div
            style={{
              padding: '0.6rem',
              borderTop: '1px solid #222',
              backgroundColor: '#111',
              display: 'flex',
              gap: '0.4rem',
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={visitorInput}
              onChange={(e) => {
                setVisitorInput(e.target.value)
                sendTypingStatus(true)
                if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
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
              }}
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
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
        {isWidgetOpen ? <FiX /> : <FiMessageSquare />}
      </button>
    </div>
  )
}