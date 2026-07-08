'use client'

import { useEffect, useRef, useState } from 'react'

export type ChatAttachmentType = 'image' | 'audio'

export interface MessageAttachment {
  type: ChatAttachmentType
  file: File | Blob
  previewUrl: string
}

export function useMessageAttachments() {
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      attachments.forEach((attachment) =>
        URL.revokeObjectURL(attachment.previewUrl),
      )
    }
  }, [attachments])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return

    const files = Array.from(event.target.files)
    const newAttachments = files.map((file) => ({
      type: 'image' as const,
      file,
      previewUrl: URL.createObjectURL(file),
    }))

    setAttachments((current) => [...current, ...newAttachments])
    event.target.value = ''
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      let options: MediaRecorderOptions | undefined = undefined
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' }
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          options = { mimeType: 'audio/ogg' }
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' }
        } else if (MediaRecorder.isTypeSupported('audio/aac')) {
          options = { mimeType: 'audio/aac' }
        }
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
        const recordedMimeType = mediaRecorder.mimeType || 'audio/wav'
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recordedMimeType,
        })

        if (audioBlob.size > 0) {
          const extension =
            recordedMimeType.split('/')[1]?.split(';')[0] || 'wav'
          const audioFile = new File(
            [audioBlob],
            `voice-note-${Date.now()}.${extension}`,
            { type: recordedMimeType },
          )

          setAttachments((current) => [
            ...current,
            {
              type: 'audio',
              file: audioFile,
              previewUrl: URL.createObjectURL(audioBlob),
            },
          ])
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start(250)
      setIsRecording(true)
      setRecordingDuration(0)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        setRecordingDuration((value) => value + 1)
      }, 1000)
    } catch (error) {
      console.error('[KeilaChat] Microphone access failed:', error)
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
    setAttachments((current) => {
      const target = current[index]
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return current.filter((_, i) => i !== index)
    })
  }

  function clearAttachments() {
    attachments.forEach((attachment) =>
      URL.revokeObjectURL(attachment.previewUrl),
    )
    setAttachments([])
  }

  return {
    attachments,
    fileInputRef,
    isRecording,
    recordingDuration,
    handleFileChange,
    removeAttachment,
    startRecording,
    stopRecording,
    clearAttachments,
  }
}
