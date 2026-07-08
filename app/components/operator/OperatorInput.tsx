// /components/operator/OperatorInput.tsx

'use client'

import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { FiMic, FiSend, FiSmile, FiSquare, FiX } from 'react-icons/fi'

import { getChatSocket } from '@/app/hooks/useChatSocket'
import { useMessageAttachments } from '@/app/hooks/useMessageAttachments'
import {
  sendOperatorMessage,
  sendTypingStatus,
  uploadMedia,
} from '@/app/lib/api/chat.api'
import { useAuthStore } from '@/app/store/useAuthStore'
import { FaPaperclip } from 'react-icons/fa'

export interface OperatorInputProps {
  sessionId: string
}

export default function OperatorInput({ sessionId }: OperatorInputProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const typingTimeout = useRef<NodeJS.Timeout | null>(null)
  const isCurrentlyTyping = useRef(false)

  const pickerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    attachments,
    fileInputRef,
    isRecording,
    recordingDuration,
    handleFileChange,
    removeAttachment,
    startRecording: startRecordingAttachment,
    stopRecording: stopRecordingAttachment,
    clearAttachments,
  } = useMessageAttachments()

  const operator = useAuthStore((state) => state.operator)
  const socket = getChatSocket()

  const canSend =
    !sending &&
    operator &&
    (message.trim().length > 0 || attachments.length > 0)

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
    }
  }, [])

  // Close emoji menu when clicking outside
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
    handleChange(message + emojiData.emoji)
    textareaRef.current?.focus()
  }

  const handleStartRecording = async () => {
    await startRecordingAttachment()
  }

  const handleStopRecording = () => {
    stopRecordingAttachment()
  }

  const removeAttachmentAtIndex = (index: number) => {
    removeAttachment(index)
  }

  const sendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed && attachments.length === 0) return
    if (sending) return

    const operatorId = operator?._id
    if (!operatorId) return

    try {
      setSending(true)
      if (typingTimeout.current) clearTimeout(typingTimeout.current)
      await sendTyping(false)

      let uploadedUrls: string[] = []

      if (attachments.length > 0) {
        const uploadPromises = attachments.map(async (att) => {
          const formData = new FormData()
          formData.append('file', att.file)
          formData.append('sessionId', sessionId)

          const result = await uploadMedia(formData)
          if (!result || result.status !== 'success' || !result.url) {
            throw new Error('File upload failed')
          }
          return result.url
        })
        uploadedUrls = await Promise.all(uploadPromises)
      }

      const messageType = attachments.some((att) => att.type === 'audio')
        ? 'audio'
        : attachments.some((att) => att.type === 'image')
          ? 'image'
          : 'text'

      await sendOperatorMessage({
        sessionId,
        senderType: 'operator',
        senderId: operatorId,
        messageText: trimmed,
        messageType,
        isFromAI: false,
        media: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      })

      setMessage('')
      clearAttachments()
      setShowEmojiPicker(false)
    } catch (error) {
      console.error('❌ Message deployment error:', error)
    } finally {
      setSending(false)
    }
  }

  const sendTyping = async (typing: boolean) => {
    isCurrentlyTyping.current = typing
    try {
      await sendTypingStatus(sessionId, { actor: 'operator', typing })
      if (socket?.connected) {
        socket.emit('typing', {
          sessionId,
          senderName: 'Operator',
          isTyping: typing,
        })
      }
    } catch (error) {
      console.error('❌ Failed to emit typing tracking payload data:', error)
    }
  }

  const handleChange = (value: string) => {
    setMessage(value)
    if (!isCurrentlyTyping.current) void sendTyping(true)

    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => void sendTyping(false), 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage()
    }
  }

  return (
    <div className="border-t border-border bg-card/80 p-3 md:p-4 backdrop-blur-md relative">
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 🎯 ATTACHMENT CAROUSEL PREVIEW BAR */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 p-2 bg-background rounded-xl border border-border max-w-7xl mx-auto">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className="relative group h-14 w-14 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
            >
              {attachment.type === 'image' ? (
                <Image
                  src={attachment.previewUrl}
                  alt="preview"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-foreground">
                  🎤 Voice
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAttachmentAtIndex(idx)}
                className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-rose-600 transition-colors"
              >
                <FiX size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🎯 FLOATING EMOJI PICKER EMBED */}
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
            height={380}
          />
        </div>
      )}

      <div className="flex items-end gap-2 md:gap-3 max-w-7xl mx-auto relative">
        <div className="flex items-center gap-1 pb-1">
          <button
            type="button"
            disabled={isRecording}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground transition hover:text-foreground rounded-lg hover:bg-muted/80 disabled:opacity-30 cursor-pointer"
          >
            <FaPaperclip size={16} />
          </button>

          <button
            type="button"
            disabled={isRecording}
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`p-2 transition rounded-lg hover:bg-muted/80 disabled:opacity-30 cursor-pointer ${showEmojiPicker ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <FiSmile size={18} />
          </button>
        </div>

        {/* 🎯 CONDITIONAL INPUT STREAM VIEWS */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-xs text-red-500 font-medium min-h-9.5">
            <span className="animate-pulse flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Recording Voice Note...</span>
            </span>
            <span className="font-mono">
              {Math.floor(recordingDuration / 60)}:
              {(recordingDuration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        ) : (
          <div className="flex-1 relative bg-background rounded-xl border border-border focus-within:border-primary/50 transition-all flex items-center px-3 py-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={operator ? 'Type a reply...' : 'Authenticating...'}
              disabled={!operator || sending}
              className="w-full max-h-32 min-h-9.5 py-2 bg-transparent text-xs outline-none resize-none disabled:opacity-50 text-foreground custom-scrollbar leading-relaxed"
            />
          </div>
        )}

        {/* 🎯 MICROPHONE ACTION RUNNER */}
        <button
          type="button"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition cursor-pointer ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {isRecording ? <FiSquare size={14} /> : <FiMic size={16} />}
        </button>

        {/* 🎯 SEND MESSAGE BUTTON */}
        <button
          type="button"
          disabled={!canSend}
          onClick={() => void sendMessage()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <FiSend size={14} />
        </button>
      </div>
    </div>
  )
}
