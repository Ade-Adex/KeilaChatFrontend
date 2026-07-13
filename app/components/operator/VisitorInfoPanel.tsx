// /components/operator/VisitorInfoPanel.tsx

'use client'

import {
  FaUser,
  FaGlobe,
  FaDesktop,
  FaLocationDot,
  FaClock,
  FaLink,
  FaHashtag,
} from 'react-icons/fa6'
import type {
  OperatorConversation,
  OperatorVisitor,
  OperatorVisitorMetadata,
} from '@/app/types/dashboard'

interface VisitorInfoPanelProps {
  session: OperatorConversation
}

// 🎯 FIXED: Omit deviceType from the base to safely accept relaxed string values from different analytics trackers
interface NestedVisitorMetadata extends Omit<
  OperatorVisitorMetadata,
  'deviceType'
> {
  location?: {
    city?: string
    country?: string
  }
  city?: string
  country?: string
  os?: string
  operatingSystem?: string
  browser?: string
  deviceType?: string 
}

interface ExtendedOperatorVisitor extends Omit<OperatorVisitor, 'metadata'> {
  metadata?: NestedVisitorMetadata
}

export default function VisitorInfoPanel({ session }: VisitorInfoPanelProps) {
  const rawVisitor = session.visitorId

  console.log('session payload:', session)
  console.log('rawVisitor payload:', rawVisitor)

  const visitor: Partial<ExtendedOperatorVisitor> | null =
    rawVisitor && typeof rawVisitor === 'object'
      ? 'visitorId' in rawVisitor
        ? ((rawVisitor as Record<string, unknown>)
            .visitorId as Partial<ExtendedOperatorVisitor>)
        : (rawVisitor as ExtendedOperatorVisitor)
      : null

  if (!visitor) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center bg-card/20">
        <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed max-w-[180px]">
          Detailed visitor telemetry profile context unpopulated.
        </p>
      </div>
    )
  }

  const metadata = visitor.metadata


  console.log('visitor metadata:', metadata)

  const locationCity = metadata?.city || metadata?.location?.city
  const locationCountry = metadata?.country || metadata?.location?.country
  const location = [locationCity, locationCountry].filter(Boolean).join(', ')

  const operatingSystem = metadata?.operatingSystem || metadata?.os || ''
  const systemBrowser = metadata?.browser || ''
  const fullClientEngine = [systemBrowser, operatingSystem]
    .filter(Boolean)
    .join(' / ')

  const lastSeenValue = visitor.lastSeen || session.updatedAt
  const lastSeenTime = lastSeenValue
    ? new Date(lastSeenValue).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown'

  const currentPage = visitor.currentPage
  const referrer = visitor.referrer

  return (
    <div className="h-full flex flex-col bg-card/40 divide-y divide-border">
      {/* Profiler Card Badge Header */}
      <div className="p-4 bg-card/50 text-center relative overflow-hidden">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.06] border border-primary/10 text-primary shadow-sm">
          <FaUser size={16} />
        </div>
        <h4 className="mt-3 text-sm font-semibold tracking-tight text-foreground truncate px-2">
          {visitor.name || 'Anonymous Visitor'}
        </h4>
        <p className="text-[11px] font-medium text-muted-foreground/80 truncate px-2 mt-0.5">
          {visitor.email || 'No identity mapping registered'}
        </p>
      </div>

      {/* Grid Meta Information Telemetries */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Device Metrics Block */}
        <div className="space-y-2.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Device Telemetry
          </h5>
          <div className="grid gap-1.5">
            {location && (
              <div className="flex items-center gap-2 rounded-lg border bg-background/40 px-2.5 py-2">
                <FaLocationDot
                  className="text-muted-foreground/70 shrink-0"
                  size={12}
                />
                <span className="font-medium text-foreground truncate">
                  {location}
                </span>
              </div>
            )}
            {metadata?.deviceType && (
              <div className="flex items-center gap-2 rounded-lg border bg-background/40 px-2.5 py-2">
                <FaDesktop
                  className="text-muted-foreground/70 shrink-0"
                  size={12}
                />
                <span className="font-medium text-foreground capitalize truncate">
                  {metadata.deviceType}
                </span>
              </div>
            )}
            {fullClientEngine && (
              <div className="flex items-center gap-2 rounded-lg border bg-background/40 px-2.5 py-2">
                <FaGlobe
                  className="text-muted-foreground/70 shrink-0"
                  size={12}
                />
                <span className="font-medium text-foreground truncate">
                  {fullClientEngine}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg border bg-background/40 px-2.5 py-2">
              <FaClock
                className="text-muted-foreground/70 shrink-0"
                size={12}
              />
              <span className="font-medium text-foreground truncate">
                Active around {lastSeenTime}
              </span>
            </div>
          </div>
        </div>

        {/* Live Vector Viewports */}
        {(currentPage || referrer) && (
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Route Context
            </h5>
            <div className="space-y-1.5">
              {currentPage && (
                <div className="rounded-lg border bg-background/40 p-2.5">
                  <span className="block text-[10px] font-semibold text-muted-foreground/70 uppercase">
                    Current Window Target
                  </span>
                  <p className="mt-1 font-mono text-[11px] break-all text-foreground leading-normal">
                    {currentPage}
                  </p>
                </div>
              )}
              {referrer && (
                <div className="rounded-lg border bg-background/40 p-2.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/70 uppercase">
                    <FaLink size={10} />
                    <span>Origin Referrer Path</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] break-all text-foreground leading-normal">
                    {referrer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Aggregated Quantities Meta Box */}
        <div className="space-y-2.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Activity Aggregations
          </h5>
          <div className="rounded-lg border bg-background/40 p-2.5 divide-y divide-border/60">
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground font-medium">
                Session Route Loads
              </span>
              <span className="font-bold text-foreground">
                {visitor.pageViews ?? 0}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-muted-foreground font-medium">
                Interaction Opened
              </span>
              <span
                className={`font-semibold ${visitor.chatOpened ? 'text-emerald-500' : 'text-muted-foreground'}`}
              >
                {visitor.chatOpened ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Meta Segment Identification Tags */}
        {visitor.tags && visitor.tags.length > 0 && (
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Context Segment Tags
            </h5>
            <div className="flex flex-wrap gap-1">
              {visitor.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded bg-primary/10 border border-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  <FaHashtag size={9} />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Structured Profile Annotation Box */}
        {visitor.notes && (
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Operator System Notes
            </h5>
            <div className="rounded-lg border border-amber-500/10 bg-amber-500/[0.02] p-2.5 text-xs text-foreground/90 leading-relaxed shadow-inner">
              {visitor.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}