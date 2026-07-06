// /app/components/dashboard/knowledge-base/CrawlUrlModal.tsx

'use client'

import { useState } from 'react'
import { Modal, Textarea, Button, Group, Stack, Text } from '@mantine/core'
import { FiGlobe } from 'react-icons/fi'
import { crawlWebsiteUrls } from '@/app/lib/api/knowledgeBase.api'

interface CrawlUrlModalProps {
  opened: boolean
  onClose: () => void
  propertyId: string
  onSuccess: () => void
}

export default function CrawlUrlModal({
  opened,
  onClose,
  propertyId,
  onSuccess,
}: CrawlUrlModalProps) {
  const [urlInput, setUrlInput] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!urlInput.trim() || !propertyId) return

    const urls = urlInput
      .split(/[\n,;\s]+/)
      .map((url) => url.trim())
      .filter((url) => url.startsWith('http://') || url.startsWith('https://'))

    if (urls.length === 0) {
      alert(
        'Please enter at least one valid absolute URL containing http:// or https://',
      )
      return
    }

   setSubmitting(true)
   try {
     await crawlWebsiteUrls(propertyId, urls)
     setUrlInput('')
     onClose()

     setTimeout(() => {
       onSuccess()
     }, 100)
   } catch (err) {
     const errorMessage =
       err instanceof Error ? err.message : 'Unknown crawler runtime failure'
     console.error('Failed to trigger background site crawler:', errorMessage)
   } finally {
     setSubmitting(false)
   }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Index Website Pages via URL"
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Provide absolute links down below. You can separate multiple URLs by
            hitting Enter, or using commas and semicolons.
          </Text>
          <Textarea
            label="Target Web Site URL Links"
            // 🎯 Updated placeholder to accurately match the supported split variants
            placeholder="https://christbcogbomoso.org&#10;https://christbcogbomoso.org/about-us&#10;https://christbcogbomoso.org/contact"
            value={urlInput}
            onChange={(e) => setUrlInput(e.currentTarget.value)}
            rows={5}
            required
            disabled={submitting}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              color="gray"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              leftSection={<FiGlobe size={16} />}
              className="bg-primary text-white"
            >
              Start Crawling Engine
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}