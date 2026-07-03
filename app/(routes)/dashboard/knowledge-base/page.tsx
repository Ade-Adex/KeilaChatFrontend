// /app/(routes)/admin/dashboard/knowledge-base/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button, Group, LoadingOverlay, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { FiSave } from 'react-icons/fi'

// Global Store Hook Integration
import { useKnowledgeBaseStore } from '@/app/store/useKnowledgeBaseStore'

// Atomic Modular Components
import KnowledgeHeader from '@/app/components/dashboard/knowledge-base/KnowledgeHeader'
import AiToggleCard from '@/app/components/dashboard/knowledge-base/AiToggleCard'
import KnowledgeStats from '@/app/components/dashboard/knowledge-base/KnowledgeStats'
import AiSettings from '@/app/components/dashboard/knowledge-base/AiSettings'
import FaqList from '@/app/components/dashboard/knowledge-base/FaqList'
import EmptyKnowledge from '@/app/components/dashboard/knowledge-base/EmptyKnowledge'
import AddFaqModal from '@/app/components/dashboard/knowledge-base/AddFaqModal'
import KnowledgeEditor from '@/app/components/dashboard/knowledge-base/KnowledgeEditor'
import TestPlayground from '@/app/components/dashboard/knowledge-base/TestPlayground'

export default function KnowledgeBasePage() {
  const {
    activePropertyId,
    isAiEnabled,
    threshold,
    faqs,
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

  // Overlay management modal states
  const [addModalOpened, addModalHandlers] = useDisclosure(false)
  const [editModalOpened, editModalHandlers] = useDisclosure(false)
  const [playgroundOpened, playgroundHandlers] = useDisclosure(false)
  const [selectedFaqIdx, setSelectedFaqIdx] = useState<number | null>(null)

  // 1. Initial workspace discovery boot hook
  useEffect(() => {
    initializeWorkspace()
  }, [initializeWorkspace])

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