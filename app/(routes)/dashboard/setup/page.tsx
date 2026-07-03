// /app/(routes)/admin/dashboard/setup/page.tsx


'use client'

import { Alert, Card, Loader } from '@mantine/core'

import { FiInfo } from 'react-icons/fi'

import { useWidgetSetup } from '@/app/hooks/settings/useWidgetSetup'

import SetupHeader from '@/app/components/dashboard/setup/SetupHeader'
import PropertyWarning from '@/app/components/dashboard/setup/PropertyWarning'
import DomainCard from '@/app/components/dashboard/setup/DomainCard'
import WidgetIdCard from '@/app/components/dashboard/setup/WidgetIdCard'
import SecurityNotice from '@/app/components/dashboard/setup/SecurityNotice'
import InstallationTabs from '@/app/components/dashboard/setup/InstallationTabs'
import InstallationNotes from '@/app/components/dashboard/setup/InstallationNotes'
import SecurityPractices from '@/app/components/dashboard/setup/SecurityPractices'
import SetupFooter from '@/app/components/dashboard/setup/SetupFooter'

export default function SetupPage() {
  const setup = useWidgetSetup()

  if (setup.loading) {
    return (
      <Card className="flex h-screen items-center justify-center bg-card!">
        <Loader size="lg" />
      </Card>
    )
  }

  if (setup.error && !setup.isNotFoundError) {
    return (
      <Alert
        color="red"
        title="Unable to Load Widget Configuration"
        icon={<FiInfo />}
      >
        {setup.error}
      </Alert>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4">
      {setup.isNotRegistered && <PropertyWarning />}

      <SetupHeader isNotRegistered={setup.isNotRegistered} />

      <div className="grid gap-6 md:grid-cols-2">
        <DomainCard domain={setup.property?.domain} />

        <WidgetIdCard
          widgetId={setup.property?.widgetId}
          disabled={setup.isNotRegistered}
          revealed={setup.revealWidgetId}
          onToggle={() => setup.setRevealWidgetId(!setup.revealWidgetId)}
          displayId={setup.getDisplayId}
        />
      </div>

      <SecurityNotice />

      <InstallationTabs
        locked={setup.isNotRegistered}
        htmlScript={setup.htmlScript}
        nextJsScript={setup.nextJsScript}
      />

      <InstallationNotes />

      <SecurityPractices />

      <SetupFooter />
    </div>
  )
}