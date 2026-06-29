//  /app/(routes)/operator/dashboard/page.tsx

'use client'

import OperatorDashboard from '@/app/components/operator/OperatorDashboard'

export default function OperatorInboxPage() {
  return (
    /* Adjusted layout computation boundary to smoothly stretch fill heights matching AppShell specs */
    <div className="h-[calc(100vh-60px-var(--mantine-spacing-md)*2)] w-full bg-background text-foreground font-sans select-none overflow-hidden rounded-xl border border-border shadow-sm transition-all duration-300">
      <OperatorDashboard />
    </div>
  )
}