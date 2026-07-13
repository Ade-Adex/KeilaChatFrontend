// /components/operator/VisitorInfoPanel.tsx

// 🎯 TARGET FILE: /components/operator/VisitorInfoPanel.tsx
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

interface NestedVisitorMetadata extends Omit<
  OperatorVisitorMetadata,
  'deviceType'
> {
  location?: {
    city?: string
    country?: string
  }
  operatingSystem?: string
  browser?: string
  deviceType?: string 
  timezone?: string
  language?: string
  screenResolution?: string
  ipAddress?: string
  userAgent?: string
}

interface ExtendedOperatorVisitor extends Omit<OperatorVisitor, 'metadata'> {
  metadata?: NestedVisitorMetadata
  currentPage?: string
  referrer?: string
  pageViews?: number
  chatOpened?: boolean
  tags?: string[]
  notes?: string
}

export default function VisitorInfoPanel({ session }: VisitorInfoPanelProps) {
  const rawVisitor = session.visitorId


  console.log(
    '[VisitorInfoPanel] rawVisitor:',
    rawVisitor
  )

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
        <p className="text-xs font-medium text-foreground/60 leading-relaxed max-w-45">
          Detailed visitor telemetry profile context unpopulated.
        </p>
      </div>
    )
  }

  const metadata = visitor.metadata

  // 🎯 FIX 1: Safely fall back through the database object architecture
  const locationCity = metadata?.location?.city || '';
  const locationCountry = metadata?.location?.country || '';
  
  // Only display a clean string if at least one parameter value isn't "Unknown"
  const cleanCity = locationCity && locationCity !== 'Unknown' ? locationCity : '';
  const cleanCountry = locationCountry && locationCountry !== 'Unknown' ? locationCountry : '';
  
  const displayLocation = [cleanCity, cleanCountry].filter(Boolean).join(', ') 
    || (locationCity === 'Unknown' || locationCountry === 'Unknown' ? 'Unknown Location' : '');

  const operatingSystem = metadata?.operatingSystem || ''
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
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/30 border border-primary/10 text-primary shadow-sm">
          <FaUser size={16} />
        </div>
        <h4 className="mt-3 text-sm font-semibold tracking-tight text-foreground truncate px-2">
          {visitor.name || 'Anonymous Visitor'}
        </h4>
        <p className="text-[11px] font-medium text-foreground/80 truncate px-2 mt-0.5">
          {visitor.email || 'No identity mapping registered'}
        </p>
      </div>

      {/* Grid Meta Information Telemetries */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
        {/* Device Metrics Block */}
        <div className="space-y-2.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
            Device Telemetry
          </h5>
          <div className="grid gap-1.5">
            {/* 🎯 FIX 2: Check for displayLocation configuration string */}
            {displayLocation && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-2">
                <FaLocationDot
                  className="text-foreground/70 shrink-0"
                  size={12}
                />
                <span className="font-medium text-foreground truncate">
                  {displayLocation}
                </span>
              </div>
            )}
            {metadata?.deviceType && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-2">
                <FaDesktop
                  className="text-foreground/70 shrink-0"
                  size={12}
                />
                <span className="font-medium text-foreground capitalize truncate">
                  {metadata.deviceType}
                </span>
              </div>
            )}
            {fullClientEngine && (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-2">
                <FaGlobe
                  className="text-foreground/70 shrink-0"
                  size={12}
                />
                <span className="font-medium text-foreground truncate">
                  {fullClientEngine}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-2.5 py-2">
              <FaClock
                className="text-foreground/70 shrink-0"
                size={12}
              />
              <span className="font-medium text-foreground truncate">
                Active around {lastSeenTime}
              </span>
            </div>
          </div>
        </div>

        {/* Route Context */}
        {(currentPage || referrer) && (
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
              Route Context
            </h5>
            <div className="space-y-1.5">
              {currentPage && (
                <div className="rounded-lg border border-border bg-background/40 p-2.5">
                  <span className="block text-[10px] font-semibold text-foreground/70 uppercase">
                    Current Window Target
                  </span>
                  <p className="mt-1 font-mono text-[11px] break-all text-foreground leading-normal">
                    {currentPage}
                  </p>
                </div>
              )}
              {referrer && (
                <div className="rounded-lg border border-border bg-background/40 p-2.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-foreground/70 uppercase">
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

        {/* Activity Aggregations */}
        <div className="space-y-2.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
            Activity Aggregations
          </h5>
          <div className="rounded-lg border border-border bg-background/40 p-2.5 divide-y divide-border/60">
            <div className="flex justify-between pb-2">
              <span className="text-foreground font-medium">
                Session Route Loads
              </span>
              <span className="font-bold text-foreground">
                {visitor.pageViews ?? 0}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-foreground font-medium">
                Interaction Opened
              </span>
              <span
                className={`font-semibold ${visitor.chatOpened ? 'text-emerald-500' : 'text-foreground'}`}
              >
                {visitor.chatOpened ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Context Segment Tags */}
        {visitor.tags && visitor.tags.length > 0 && (
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
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

        {/* Operator System Notes */}
        {visitor.notes && (
          <div className="space-y-2.5">
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-foreground/80">
              Operator System Notes
            </h5>
            <div className="rounded-lg border border-border bg-amber-500/2 p-2.5 text-xs text-foreground/90 leading-relaxed shadow-inner">
              {visitor.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}