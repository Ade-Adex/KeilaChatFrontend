// /app/(routes)/admin/dashboard/knowledge-base/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { Button, Group, LoadingOverlay, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { FiSave } from 'react-icons/fi'

// Type Imports
import type { IFaqItem, IKnowledgeBase } from '@/app/types/knowledgeBase'

// API Utilities
import { getMyProperties } from '@/app/lib/api/chat.api' // 🎯 Wired from your chat API
import {
  getKnowledgeBaseSettings,
  updateKnowledgeBaseSettings,
} from '@/app/lib/api/knowledgeBase.api'
import { getErrorMessage } from '@/app/lib/utils/error'

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
  // 🎯 Dynamically populated from your properties array lookup
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null)

  // console.log('Active Property ID:', activePropertyId);

  // Form settings states
  const [isAiEnabled, setIsAiEnabled] = useState(true)
  const [threshold, setThreshold] = useState(80)
  const [faqs, setFaqs] = useState<IFaqItem[]>([])

  // Loading indicators
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // Retained state properties to prevent wiping configuration metrics
  const [rawConfig, setRawConfig] = useState<Partial<IKnowledgeBase>>({})

  // Overlay management hooks
  const [addModalOpened, addModalHandlers] = useDisclosure(false)
  const [editModalOpened, editModalHandlers] = useDisclosure(false)
  const [playgroundOpened, playgroundHandlers] = useDisclosure(false)
  const [selectedFaqIdx, setSelectedFaqIdx] = useState<number | null>(null)

  // 1. Fetch properties on mount, select the primary one, then fetch KB settings
  useEffect(() => {
    async function loadWorkspaceAndKnowledge() {
      setLoading(true)
      try {
        // Step A: Pull properties assigned to this operator/account
        const propertiesRes = await getMyProperties()
        const firstProperty = propertiesRes?.data?.[0]

        if (!firstProperty?._id) {
          notifications.show({
            title: 'Workspace Error',
            message: 'No active properties found for this account layout.',
            color: 'red',
          })
          return
        }

        const propertyId = firstProperty._id
        setActivePropertyId(propertyId)

        // Step B: Query knowledge base using the verified property identity
        const kbRes = await getKnowledgeBaseSettings(propertyId)
        if (kbRes?.success && kbRes.data) {
          setIsAiEnabled(kbRes.data.isAiEnabled ?? true)
          setThreshold(
            Math.round((kbRes.data.confidenceThreshold ?? 0.8) * 100),
          )
          setFaqs(kbRes.data.faqs ?? [])
          setRawConfig(kbRes.data)
        }
      } catch (err) {
        notifications.show({
          title: 'Initialization Error',
          message: getErrorMessage(err),
          color: 'red',
        })
      } finally {
        setLoading(false)
      }
    }

    loadWorkspaceAndKnowledge()
  }, [])

  // Helper method to sync any state update immediately with the database
  const persistKnowledgeBaseState = async (
    updatedFaqs: IFaqItem[],
    nextAiEnabled = isAiEnabled,
    nextThreshold = threshold,
  ) => {
    if (!activePropertyId) return false
    setSyncing(true)
    try {
      const payload = {
        ...rawConfig,
        isAiEnabled: nextAiEnabled,
        confidenceThreshold: nextThreshold / 100,
        faqs: updatedFaqs,
      }

      const response = await updateKnowledgeBaseSettings(
        activePropertyId,
        payload,
      )

      // Update local state matrix on verification
      setFaqs(response.data.faqs ?? [])
      setRawConfig(response.data)
      return true
    } catch (err) {
      notifications.show({
        title: 'Sync Error',
        message: getErrorMessage(err),
        color: 'red',
      })
      return false
    } finally {
      setSyncing(false)
    }
  }

  // 2. Add New Element Connected to Backend
  const handleAddFaqItem = async (newItem: IFaqItem) => {
    const freshFaqs = [...faqs, newItem]
    const success = await persistKnowledgeBaseState(freshFaqs)
    if (success) {
      notifications.show({
        title: 'Success',
        message: 'FAQ item saved directly to backend records.',
        color: 'green',
      })
    }
  }

  // 3. Edit Handler Open Selection
  const handleOpenEditModal = (idx: number) => {
    setSelectedFaqIdx(idx)
    editModalHandlers.open()
  }

  // 4. Save Edited Element Connected to Backend
  const handleSaveEditItem = async (updatedItem: IFaqItem) => {
    if (selectedFaqIdx === null) return
    const freshFaqs = faqs.map((item, i) =>
      i === selectedFaqIdx ? updatedItem : item,
    )

    const success = await persistKnowledgeBaseState(freshFaqs)
    if (success) {
      setSelectedFaqIdx(null)
      notifications.show({
        title: 'Matrix Updated',
        message: 'Modified entry saved successfully.',
        color: 'green',
      })
    }
  }

  // 5. Remove Element Connected to Backend
  const handleRemoveFaqItem = async (idx: number) => {
    const freshFaqs = faqs.filter((_, i) => i !== idx)
    const success = await persistKnowledgeBaseState(freshFaqs)
    if (success) {
      notifications.show({
        title: 'Item Deleted',
        message: 'Removed from data clusters permanently.',
        color: 'orange',
      })
    }
  }

  // 6. Connected Control Handlers for Toggle Switch and Range Sliders
  const handleToggleAiEngine = async (checked: boolean) => {
    setIsAiEnabled(checked)
    await persistKnowledgeBaseState(faqs, checked, threshold)
  }

  const handleSliderThresholdChange = async (val: number) => {
    setThreshold(val)
    await persistKnowledgeBaseState(faqs, isAiEnabled, val)
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

      <AiToggleCard isAiEnabled={isAiEnabled} onToggle={handleToggleAiEngine} />

      {isAiEnabled && (
        <AiSettings
          threshold={threshold}
          onChangeThreshold={handleSliderThresholdChange}
        />
      )}

      {faqs.length > 0 ? (
        <FaqList
          faqs={faqs}
          onEdit={handleOpenEditModal}
          onRemove={handleRemoveFaqItem}
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
          onClick={() => persistKnowledgeBaseState(faqs)}
          className="bg-primary text-white cursor-pointer"
        >
          Force Cloud Sync
        </Button>
      </Group>

      <AddFaqModal
        opened={addModalOpened}
        onClose={addModalHandlers.close}
        onAdd={handleAddFaqItem}
      />

      <KnowledgeEditor
        key={selectedFaqIdx !== null ? `edit-${selectedFaqIdx}` : 'edit-none'}
        opened={editModalOpened}
        onClose={editModalHandlers.close}
        faq={selectedFaqIdx !== null ? faqs[selectedFaqIdx] : null}
        onSave={handleSaveEditItem}
      />

      <TestPlayground
        opened={playgroundOpened}
        onClose={playgroundHandlers.close}
        propertyId={activePropertyId ?? ''}
      />
    </Box>
  )
}