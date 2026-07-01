import React from 'react'

interface MessageStatusTicksProps {
  status?: 'sent' | 'delivered' | 'seen' | 'failed'
}

const MessageStatusTicks = ({ status }: MessageStatusTicksProps) => {
  switch (status) {
    case 'sent':
      return (
        <span
          className="text-foreground/50 text-[10px] tracking-normal font-normal select-none"
          title="Sent to Server"
        >
          ✓
        </span>
      )
    case 'delivered':
      return (
        <span
          className="text-foreground/80 text-[10px] tracking-[-3px] pr-1 font-bold select-none"
          title="Delivered to Workspace Desk"
        >
          ✓✓
        </span>
      )
    case 'seen':
      return (
        <span
          className="text-sky-500 dark:text-sky-400 font-extrabold text-[10px] tracking-[-3px] pr-1 select-none"
          title="Seen by Operator"
        >
          ✓✓
        </span>
      )
    case 'failed':
      return (
        <span className="text-red-500 font-semibold select-none" title="Failed">
          ✕
        </span>
      )
    default:
      return (
        <span className="text-foreground/40 text-[10px] select-none">✓</span>
      )
  }
}

export default MessageStatusTicks
