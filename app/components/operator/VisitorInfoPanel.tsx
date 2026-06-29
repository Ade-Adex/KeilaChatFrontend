// /components/operator/VisitorInfoPanel.tsx

'use client'

import {
  FaUser,
  FaGlobe,
  FaDesktop,
  FaLocationDot,
  FaClock,
  FaLink,
} from 'react-icons/fa6'

import type {
  OperatorConversation,
  OperatorVisitor,
} from '@/app/types/dashboard'

interface VisitorInfoPanelProps {
  session: OperatorConversation
}

export default function VisitorInfoPanel({ session }: VisitorInfoPanelProps) {
  const visitor: OperatorVisitor | undefined = session.visitorId

  if (!visitor) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Visitor information unavailable
        </p>
      </div>
    )
  }

  const location = [visitor.metadata?.city, visitor.metadata?.country]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FaUser className="text-xl" />
        </div>

        <div className="mt-4 text-center">
          <h2 className="font-semibold">
            {visitor.name ?? 'Anonymous Visitor'}
          </h2>

          <p className="text-sm text-muted-foreground">
            {visitor.email ?? 'No email provided'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-6 p-6">
        {/* Visitor Details */}
        <section>
          <h3 className="mb-3 font-medium">Visitor Details</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FaLocationDot />

              <span className="text-sm">{location || 'Unknown location'}</span>
            </div>

            <div className="flex items-center gap-3">
              <FaDesktop />

              <span className="text-sm capitalize">
                {visitor.metadata?.deviceType ?? 'Unknown device'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FaGlobe />

              <span className="text-sm">
                {visitor.metadata?.browser ?? 'Unknown browser'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <FaClock />

              <span className="text-sm">{visitor.lastSeen ?? 'Unknown'}</span>
            </div>
          </div>
        </section>

        {/* Current Page */}
        <section>
          <h3 className="mb-3 font-medium">Current Page</h3>

          <div className="rounded-lg border border-border p-3">
            <p className="break-all text-sm">
              {visitor.currentPage ?? 'No page information'}
            </p>
          </div>
        </section>

        {/* Referrer */}
        <section>
          <h3 className="mb-3 font-medium">Referrer</h3>

          <div className="flex gap-3 rounded-lg border border-border p-3">
            <FaLink className="mt-1 shrink-0" />

            <p className="break-all text-sm">
              {visitor.referrer ?? 'Direct visit'}
            </p>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <h3 className="mb-3 font-medium">Statistics</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Page Views</span>

              <span className="font-medium">{visitor.pageViews ?? 0}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Chat Opened</span>

              <span className="font-medium">
                {visitor.chatOpened ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </section>

        {/* Tags */}
        {visitor.tags && visitor.tags.length > 0 && (
          <section>
            <h3 className="mb-3 font-medium">Tags</h3>

            <div className="flex flex-wrap gap-2">
              {visitor.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {visitor.notes && (
          <section>
            <h3 className="mb-3 font-medium">Notes</h3>

            <div className="rounded-lg border border-border p-3 text-sm">
              {visitor.notes}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}