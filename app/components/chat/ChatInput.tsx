//  /app/components/chat/ChatInput.tsx

'use client'

import { useMessageAttachments } from '@/app/hooks/useMessageAttachments'
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import {
  FiMic,
  FiPaperclip,
  FiSend,
  FiSmile,
  FiSquare,
  FiX,
} from 'react-icons/fi'

interface ChatInputProps {
  value: string
  disabled?: boolean
  onChange: (value: string) => void
  onSend: (
    attachments?: { type: 'image' | 'audio'; file: File | Blob }[],
  ) => void
}

export default function ChatInput({
  value,
  disabled = false,
  onChange,
  onSend,
}: ChatInputProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const {
    attachments,
    fileInputRef,
    isRecording,
    recordingDuration,
    handleFileChange,
    removeAttachment,
    startRecording,
    stopRecording,
    clearAttachments,
  } = useMessageAttachments()

  const canSend =
    !disabled && (value.trim().length > 0 || attachments.length > 0)

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && canSend) {
      event.preventDefault()
      triggerSend()
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleEmojiClick(emojiData: EmojiClickData) {
    onChange(value + emojiData.emoji)
    inputRef.current?.focus()
  }

  function triggerSend() {
    if (!canSend) return
    onSend(
      attachments.map((attachment) => ({
        type: attachment.type,
        file: attachment.file,
      })),
    )
    clearAttachments()
    onChange('')
    setShowEmojiPicker(false)
  }

  if (disabled) {
    return (
      <div className="border-t bg-card p-4 text-center text-sm text-foreground">
        This chat session has ended.
      </div>
    )
  }

  return (
    <div className="relative border-t border-border bg-card p-3">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 p-2 bg-background rounded-xl border border-border">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className="relative group h-14 w-14 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
            >
              {attachment.type === 'image' ? (
                <Image
                  src={attachment.previewUrl}
                  alt="preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-foreground">
                  🎤 Audio
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showEmojiPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-16 left-4 z-50 shadow-2xl"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme={Theme.AUTO}
            width={320}
            height={400}
          />
        </div>
      )}

      <div className="flex items-center gap-1.5 sm:gap-2 w-full max-w-full min-w-0">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full cursor-pointer text-foreground transition hover:bg-accent hover:text-foreground ${
            isRecording ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <FiPaperclip size={18} className="sm:w-5 sm:h-5" />
        </button>

        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full cursor-pointer text-foreground transition hover:bg-accent hover:text-foreground ${
            isRecording ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <FiSmile size={18} className="sm:w-5 sm:h-5" />
        </button>

        {isRecording ? (
          <div className="flex-1 min-w-0 flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-500 font-medium truncate">
            <span className="animate-pulse flex items-center gap-1.5 min-w-0 truncate">
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              <span className="truncate">Recording...</span>
            </span>
            <span className="shrink-0 font-mono pl-2">
              {Math.floor(recordingDuration / 60)}:
              {(recordingDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value}
            placeholder="Type a message..."
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 rounded-full border border-border bg-background text-foreground px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-primary placeholder:text-muted-foreground"
          />
        )}

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full transition cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'text-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {isRecording ? (
            <FiSquare size={16} className="sm:w-4.5 sm:h-4.5" />
          ) : (
            <FiMic size={18} className="sm:w-5 sm:h-5" />
          )}
        </button>

        <button
          type="button"
          disabled={!canSend}
          onClick={triggerSend}
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend size={15} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      <div className="mt-2 text-center text-[10px] text-foreground">
        Powered by <strong>Keila Technologies</strong>
      </div>
    </div>
  )
}
