//  /app/components/chat/ChatInput.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import {
  FiSend,
  FiSmile,
  FiPaperclip,
  FiMic,
  FiSquare,
  FiX,
} from 'react-icons/fi'
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react'

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
  const [attachments, setAttachments] = useState<
    { type: 'image' | 'audio'; file: File | Blob; previewUrl: string }[]
  >([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const pickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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

  // --- Image Attachment Handler ---
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return
    const files = Array.from(e.target.files)

    const newAttachments = files.map((file) => ({
      type: 'image' as const,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setAttachments((prev) => [...prev, ...newAttachments])
  }

  // --- Voice Recording Handlers ---
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })
        setAttachments((prev) => [
          ...prev,
          {
            type: 'audio',
            file: audioBlob,
            previewUrl: URL.createObjectURL(audioBlob),
          },
        ])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to access microphone:', err)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  function triggerSend() {
    if (!canSend) return
    // Forward text and raw binaries up to parent component pipeline
    onSend(attachments.map((a) => ({ type: a.type, file: a.file })))
    setAttachments([])
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
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 p-2 bg-background rounded-xl border border-border">
          {attachments.map((attachment, idx) => (
            <div
              key={idx}
              className="relative group h-14 w-14 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center"
            >
              {attachment.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
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

      {/* Emoji Picker Panel */}
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

      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Pin Trigger */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <FiPaperclip size={20} />
        </button>

        {/* Emoji Trigger */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <FiSmile size={20} />
        </button>

        {/* Input Text Field or Voice Recorder Metadata Overlay */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-full px-4 py-2 text-sm text-red-500 font-medium">
            <span className="animate-pulse flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Recording Voice...
            </span>
            <span>
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
            className="flex-1 rounded-full border border-border bg-background text-foreground px-4 py-2.5 text-sm outline-none transition focus:border-primary"
          />
        )}

        {/* Voice Recording Microphone Trigger */}
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
            isRecording
              ? 'bg-red-600 text-white animate-pulse'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
        >
          {isRecording ? <FiSquare size={18} /> : <FiMic size={20} />}
        </button>

        {/* Send Action Trigger */}
        <button
          type="button"
          disabled={!canSend}
          onClick={triggerSend}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend size={18} />
        </button>
      </div>

      <div className="mt-2 text-center text-[10px] text-foreground">
        Powered by <strong>Keila Technologies</strong>
      </div>
    </div>
  )
}