// /app/(routes)/admin/dashboard/knowledge-base/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button, Group, LoadingOverlay, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { FiSave } from 'react-icons/fi'
import { useKnowledgeBaseStore } from '@/app/store/useKnowledgeBaseStore'

import KnowledgeHeader from '@/app/components/dashboard/knowledge-base/KnowledgeHeader'
import AiToggleCard from '@/app/components/dashboard/knowledge-base/AiToggleCard'
import KnowledgeStats from '@/app/components/dashboard/knowledge-base/KnowledgeStats'
import AiSettings from '@/app/components/dashboard/knowledge-base/AiSettings'
import FaqList from '@/app/components/dashboard/knowledge-base/FaqList'
import EmptyKnowledge from '@/app/components/dashboard/knowledge-base/EmptyKnowledge'
import AddFaqModal from '@/app/components/dashboard/knowledge-base/AddFaqModal'
import KnowledgeEditor from '@/app/components/dashboard/knowledge-base/KnowledgeEditor'
import TestPlayground from '@/app/components/dashboard/knowledge-base/TestPlayground'
import CrawlUrlModal from '@/app/components/dashboard/knowledge-base/CrawlUrlModal'
import CrawledSourcesList from '@/app/components/dashboard/knowledge-base/CrawledSourcesList'

export default function KnowledgeBasePage() {
  const {
    activePropertyId,
    isAiEnabled,
    threshold,
    faqs,
    crawledSources = [],
    loading,
    syncing,
    initializeWorkspace,
    setAiEnabled,
    setThreshold,
    addFaqItem,
    saveEditItem,
    removeFaqItem,
    forceCloudSync,
  } = useKnowledgeBaseStore()

  const [addModalOpened, addModalHandlers] = useDisclosure(false)
  const [editModalOpened, editModalHandlers] = useDisclosure(false)
  const [playgroundOpened, playgroundHandlers] = useDisclosure(false)
  const [crawlModalOpened, crawlModalHandlers] = useDisclosure(false)
  const [selectedFaqIdx, setSelectedFaqIdx] = useState<number | null>(null)

  // 1. Initial workspace discovery boot hook
  useEffect(() => {
    initializeWorkspace()
  }, [initializeWorkspace])

  // 🎯 Polling loop checking for pending crawl requests
  useEffect(() => {
    const hasPending = crawledSources.some((s) => s.status === 'pending')
    if (!hasPending) return

    const interval = setInterval(() => {
      // Force Zustand to bypass its internal initialization lock flag
      useKnowledgeBaseStore.setState({ initialized: false })
      initializeWorkspace()
    }, 4000)

    return () => clearInterval(interval)
  }, [crawledSources, initializeWorkspace])

  const handleOpenEditModal = (idx: number) => {
    setSelectedFaqIdx(idx)
    editModalHandlers.open()
  }

  return (
    <Box className="relative mx-auto max-w-5xl space-y-8 p-4 pb-16">
      <LoadingOverlay visible={loading} overlayProps={{ blur: 1 }} />

      <KnowledgeHeader
        onOpenAddModal={addModalHandlers.open}
        onOpenPlayground={playgroundHandlers.open}
        onOpenCrawlModal={crawlModalHandlers.open}
        faqCount={faqs.length}
      />

      <KnowledgeStats
        faqCount={faqs.length}
        isAiEnabled={isAiEnabled}
        threshold={threshold}
      />

      <AiToggleCard isAiEnabled={isAiEnabled} onToggle={setAiEnabled} />

      {isAiEnabled && (
        <AiSettings threshold={threshold} onChangeThreshold={setThreshold} />
      )}

      {faqs.length > 0 ? (
        <FaqList
          faqs={faqs}
          onEdit={handleOpenEditModal}
          onRemove={removeFaqItem}
        />
      ) : (
        <EmptyKnowledge onOpenAddModal={addModalHandlers.open} />
      )}

      <CrawledSourcesList sources={crawledSources} />

      <Group justify="flex-end" mt="xl">
        <Button
          leftSection={<FiSave size={16} />}
          size="md"
          loading={syncing}
          disabled={!activePropertyId}
          onClick={forceCloudSync}
          className="bg-primary text-white cursor-pointer"
        >
          Force Cloud Sync
        </Button>
      </Group>

      <AddFaqModal
        opened={addModalOpened}
        onClose={addModalHandlers.close}
        onAdd={addFaqItem}
      />

      <CrawlUrlModal
        opened={crawlModalOpened}
        onClose={crawlModalHandlers.close}
        propertyId={activePropertyId ?? ''}
        onSuccess={initializeWorkspace}
      />

      <KnowledgeEditor
        key={selectedFaqIdx !== null ? `edit-${selectedFaqIdx}` : 'edit-none'}
        opened={editModalOpened}
        onClose={editModalHandlers.close}
        faq={selectedFaqIdx !== null ? faqs[selectedFaqIdx] : null}
        onSave={(updatedItem) => {
          if (selectedFaqIdx !== null) {
            saveEditItem(selectedFaqIdx, updatedItem)
            setSelectedFaqIdx(null)
          }
        }}
      />

      <TestPlayground
        opened={playgroundOpened}
        onClose={playgroundHandlers.close}
        propertyId={activePropertyId ?? ''}
      />
    </Box>
  )
}