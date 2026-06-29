// /components/operator/OperatorDashboard.tsx

'use client'

import { useState } from 'react'

import ConversationSidebar from './ConversationSidebar'
import OperatorWorkspace from './OperatorWorkspace'
import VisitorInfoPanel from './VisitorInfoPanel'
import EmptyState from './EmptyState'
import OperatorHeader from './OperatorHeader'

import type { OperatorConversation } from '@/app/types/dashboard'

export default function OperatorDashboard() {

  const [selectedConversation, setSelectedConversation] =
    useState<OperatorConversation | null>(null)

  return (
    <div className="flex h-screen flex-col bg-background">
      <OperatorHeader />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[340px] border-r border-border bg-card">
          <ConversationSidebar
            selectedConversation={selectedConversation}
            onSelect={setSelectedConversation}
          />
        </aside>

        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            {selectedConversation ? (
              <OperatorWorkspace session={selectedConversation} />
            ) : (
              <EmptyState />
            )}
          </div>

          {selectedConversation && (
            <aside className="w-[340px] border-l border-border">
              <VisitorInfoPanel session={selectedConversation} />
            </aside>
          )}
        </main>
      </div>
    </div>
  )
}