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
      // 1. Request audio access with robust hardware configurations
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // 2. Cross-browser MIME Type sniffing fallback suite
      let options = {}
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' }
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        options = { mimeType: 'audio/ogg' }
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' }
      } else if (MediaRecorder.isTypeSupported('audio/aac')) {
        options = { mimeType: 'audio/aac' }
      }

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        // Fallback context type assignment based on matching sniffing options chosen above
        const recordedMimeType = mediaRecorder.mimeType || 'audio/wav'
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recordedMimeType,
        })

        // Skip adding if the recording is empty or corrupted
        if (audioBlob.size > 0) {
          // Create an actual File object from Blob so backend parsers handle names cleanly
          const audioFile = new File(
            [audioBlob],
            `voice-note-${Date.now()}.${recordedMimeType.split('/')[1]?.split(';')[0] || 'wav'}`,
            {
              type: recordedMimeType,
            },
          )

          setAttachments((prev) => [
            ...prev,
            {
              type: 'audio',
              file: audioFile,
              previewUrl: URL.createObjectURL(audioBlob),
            },
          ])
        }

        // Clean up hardware resources instantly
        stream.getTracks().forEach((track) => track.stop())
      }

      // Collect data fragments continuously every 250ms for performance stability
      mediaRecorder.start(250)
      setIsRecording(true)
      setRecordingDuration(0)

      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('[KeilaChat] Advanced Microphone Access Failed:', err)
      alert(
        'Could not access microphone. Please check your browser privacy permissions.',
      )
      setIsRecording(false)
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
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

      <div className="flex items-center gap-1.5 sm:gap-2 w-full max-w-full min-w-0">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Attachment Pin Trigger — Hidden on mobile while recording to maximize viewport space */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full cursor-pointer text-foreground transition hover:bg-accent hover:text-foreground ${
            isRecording ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <FiPaperclip size={18} className="sm:w-[20px] sm:h-[20px]" />
        </button>

        {/* Emoji Trigger — Hidden on mobile while recording */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full cursor-pointer text-foreground transition hover:bg-accent hover:text-foreground ${
            isRecording ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <FiSmile size={18} className="sm:w-[20px] sm:h-[20px]" />
        </button>

        {/* Input Text Field or Voice Recorder Metadata Overlay */}
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

        {/* Voice Recording Microphone Trigger */}
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
            <FiSquare size={16} className="sm:w-[18px] sm:h-[18px]" />
          ) : (
            <FiMic size={18} className="sm:w-[20px] sm:h-[20px]" />
          )}
        </button>

        {/* Send Action Trigger */}
        <button
          type="button"
          disabled={!canSend}
          onClick={triggerSend}
          className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend
            size={15}
            className="sm:w-[16px] sm:h-[16px] translation-x-[0.5px]"
          />
        </button>
      </div>

      <div className="mt-2 text-center text-[10px] text-foreground">
        Powered by <strong>Keila Technologies</strong>
      </div>
    </div>
  )
}