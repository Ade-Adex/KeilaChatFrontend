// /components/operator/ConversationCard.tsx

'use client'

import { memo } from 'react'
import { FaUser, FaRobot, FaCircle } from 'react-icons/fa'
import type { OperatorConversation } from '@/app/types/dashboard'

interface ConversationCardProps {
  session: OperatorConversation
  selected?: boolean
  onClick?: () => void
}

function ConversationCard({
  session,
  selected = false,
  onClick,
}: ConversationCardProps) {
  // Safe validation check avoiding runtime string selection errors
  const visitorName =
    session.visitorId &&
    typeof session.visitorId === 'object' &&
    'name' in session.visitorId
      ? session.visitorId.name || 'Anonymous Visitor'
      : 'Anonymous Visitor'

  const unread = session.unreadOperator ?? 0
  const lastMessage = session.lastMessage || 'No messages'

  const time = session.lastMessageAt
    ? new Date(session.lastMessageAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`
        w-full rounded-xl border p-4 text-left transition-all duration-200
        hover:bg-muted hover:shadow-sm
        ${selected ? 'border-primary bg-muted' : 'border-border'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <FaUser className="text-primary" size={15} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{visitorName}</h3>
              {session.aiHandled && (
                <FaRobot size={12} className="text-blue-500" />
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <FaCircle
                size={8}
                className={
                  session.status === 'active'
                    ? 'text-green-500'
                    : session.status === 'queued'
                      ? 'text-yellow-500'
                      : session.status === 'waiting'
                        ? 'text-orange-500'
                        : 'text-gray-400'
                }
              />
              <span className="text-xs capitalize text-muted-foreground">
                {session.status}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs capitalize text-muted-foreground">
                {session.priority}
              </span>
            </div>
          </div>
        </div>

        {unread > 0 && (
          <div className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
            {unread}
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {lastMessage}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-wide">
          {session.channel}
        </span>
        {time && <span className="text-xs text-muted-foreground">{time}</span>}
      </div>
    </button>
  )
}

export default memo(ConversationCard)