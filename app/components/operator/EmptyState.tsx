// /app/components/operator/EmptyState.tsx


'use client'

import { FaComments } from 'react-icons/fa'

export default function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <div className="mx-auto max-w-md px-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <FaComments className="text-4xl text-primary" />
        </div>

        {/* Title */}
        <h2 className="mt-6 text-2xl font-semibold">
          No Conversation Selected
        </h2>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Select a conversation from the sidebar to begin chatting with a
          visitor, review previous messages, and manage the conversation.
        </p>

        {/* Helper */}
        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            • Select a queued conversation to accept it
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            • Continue active conversations in real time
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            • View visitor information and analytics on the right panel
          </p>
        </div>
      </div>
    </div>
  )
}