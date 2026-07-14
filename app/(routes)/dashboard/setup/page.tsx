// // /app/(routes)/admin/dashboard/setup/page.tsx

// 'use client'

// import { Alert, Card, Loader } from '@mantine/core'
// import { useState } from 'react'
// import { FiInfo } from 'react-icons/fi'
// import { useWidgetSetup } from '@/app/hooks/settings/useWidgetSetup'
// import { updateWebsite } from '@/app/lib/api/settings.api'

// import SetupHeader from '@/app/components/dashboard/setup/SetupHeader'
// import PropertyWarning from '@/app/components/dashboard/setup/PropertyWarning'
// import DomainCard from '@/app/components/dashboard/setup/DomainCard'
// import WidgetIdCard from '@/app/components/dashboard/setup/WidgetIdCard'
// import WidgetFeatureCard from '@/app/components/dashboard/setup/WidgetFeatureCard'
// import SecurityNotice from '@/app/components/dashboard/setup/SecurityNotice'
// import InstallationTabs from '@/app/components/dashboard/setup/InstallationTabs'
// import InstallationNotes from '@/app/components/dashboard/setup/InstallationNotes'
// import SecurityPractices from '@/app/components/dashboard/setup/SecurityPractices'
// import SetupFooter from '@/app/components/dashboard/setup/SetupFooter'

// export default function SetupPage() {
//   const setup = useWidgetSetup()
//   const [isUpdating, setIsUpdating] = useState(false)

//   // 🎯 Local optimistic state for the toggles to provide instant visual response
//   const [localFeatures, setLocalFeatures] = useState<{
//     allowFileUpload: boolean | null
//     allowVoiceRecordings: boolean | null
//   }>({
//     allowFileUpload: null,
//     allowVoiceRecordings: null,
//   })

//   if (setup.loading) {
//     return (
//       <Card className="flex h-screen items-center justify-center bg-card!">
//         <Loader size="lg" />
//       </Card>
//     )
//   }

//   if (setup.error && !setup.isNotFoundError) {
//     return (
//       <Alert
//         color="red"
//         title="Unable to Load Widget Configuration"
//         icon={<FiInfo />}
//       >
//         {setup.error}
//       </Alert>
//     )
//   }

//   // 🎯 Derived State: Fall back from optimistic state to database values
//   const allowFileUpload =
//     localFeatures.allowFileUpload ??
//     setup.property?.widgetSettings?.allowFileUpload ??
//     true

//   const allowVoiceRecordings =
//     localFeatures.allowVoiceRecordings ??
//     setup.property?.widgetSettings?.allowVoiceRecordings ??
//     true

//   // 🎯 Professional API Mutation Save Trigger
//   const handleFeatureToggle = async (
//     field: 'allowFileUpload' | 'allowVoiceRecordings',
//     checked: boolean,
//   ) => {
//     if (!setup.property) return

//     // 1. Optimistically update local UI state immediately
//     setLocalFeatures((prev) => ({
//       ...prev,
//       [field]: checked,
//     }))

//     // 2. Persist immediately to your API endpoint backend controller
//     try {
//       setIsUpdating(true)

//       const nextUploadValue =
//         field === 'allowFileUpload' ? checked : allowFileUpload
//       const nextVoiceValue =
//         field === 'allowVoiceRecordings' ? checked : allowVoiceRecordings

//       await updateWebsite({
//         name: setup.property.name,
//         domain: setup.property.domain,
//         aiName: setup.property.widgetSettings?.aiName ?? 'AI Assistant',
//         allowedDomains: setup.property.allowedDomains,
//         category: setup.property.details.category,
//         subCategory: setup.property.details.subCategory,
//         region: setup.property.details.region,
//         description: setup.property.details.description,
//         logoUrl: setup.property.details.logoUrl,
//         widgetSettings: {
//           allowFileUpload: nextUploadValue,
//           allowVoiceRecordings: nextVoiceValue,
//         },
//       })
//     } catch (err) {
//       console.error('[Setup Settings] Error saving permissions mutation:', err)

//       // Rollback to previous state on failure
//       setLocalFeatures((prev) => ({
//         ...prev,
//         [field]: !checked,
//       }))
//     } finally {
//       setIsUpdating(false)
//     }
//   }

//   return (
//     <div className="mx-auto max-w-5xl space-y-8 md:p-4">
//       {setup.isNotRegistered && <PropertyWarning />}

//       <SetupHeader isNotRegistered={setup.isNotRegistered} />

//       <div className="grid gap-6 md:grid-cols-2">
//         <DomainCard domain={setup.property?.domain} />

//         <WidgetIdCard
//           widgetId={setup.property?.widgetId}
//           disabled={setup.isNotRegistered}
//           revealed={setup.revealWidgetId}
//           onToggle={() => setup.setRevealWidgetId(!setup.revealWidgetId)}
//           displayId={setup.getDisplayId}
//         />
//       </div>

//       {/* 🎯 Using a component key combined with direct derived assignment completely evades the cascade render lifecycle warning */}
//       {!setup.isNotRegistered && setup.property && (
//         <div className={isUpdating ? 'opacity-80 pointer-events-none' : ''}>
//           <WidgetFeatureCard
//             key={setup.property._id}
//             allowFileUpload={allowFileUpload}
//             allowVoiceRecordings={allowVoiceRecordings}
//             onToggleUpload={(checked) =>
//               handleFeatureToggle('allowFileUpload', checked)
//             }
//             onToggleVoice={(checked) =>
//               handleFeatureToggle('allowVoiceRecordings', checked)
//             }
//           />
//         </div>
//       )}

//       <SecurityNotice />

//       <InstallationTabs
//         locked={setup.isNotRegistered}
//         htmlScript={setup.htmlScript}
//         nextJsScript={setup.nextJsScript}
//       />

//       <InstallationNotes />

//       <SecurityPractices />

//       <SetupFooter />
//     </div>
//   )
// }




// /app/(routes)/admin/dashboard/setup/page.tsx
'use client'

import { Alert, Card, Loader } from '@mantine/core'
import { useState } from 'react'
import { FiInfo } from 'react-icons/fi'
import { useWidgetSetup } from '@/app/hooks/settings/useWidgetSetup'
import { useDashboardStore } from '@/app/store/useDashboardStore' // 🎯 Import global store sync
import { updateWebsite } from '@/app/lib/api/settings.api'

import SetupHeader from '@/app/components/dashboard/setup/SetupHeader'
import PropertyWarning from '@/app/components/dashboard/setup/PropertyWarning'
import DomainCard from '@/app/components/dashboard/setup/DomainCard'
import WidgetIdCard from '@/app/components/dashboard/setup/WidgetIdCard'
import WidgetFeatureCard from '@/app/components/dashboard/setup/WidgetFeatureCard'
import SecurityNotice from '@/app/components/dashboard/setup/SecurityNotice'
import InstallationTabs from '@/app/components/dashboard/setup/InstallationTabs'
import InstallationNotes from '@/app/components/dashboard/setup/InstallationNotes'
import SecurityPractices from '@/app/components/dashboard/setup/SecurityPractices'
import SetupFooter from '@/app/components/dashboard/setup/SetupFooter'

export default function SetupPage() {
  const setup = useWidgetSetup()
  const [isUpdating, setIsUpdating] = useState(false)
  const updateCachedProperty = useDashboardStore((state) => state.updateCachedProperty) // 🎯 Hook into Cache Writer

  // Local optimistic state for instant toggling feedback
  const [localFeatures, setLocalFeatures] = useState<{
    allowFileUpload: boolean | null
    allowVoiceRecordings: boolean | null
  }>({
    allowFileUpload: null,
    allowVoiceRecordings: null,
  })

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

  const allowFileUpload =
    localFeatures.allowFileUpload ??
    setup.property?.widgetSettings?.allowFileUpload ??
    true

  const allowVoiceRecordings =
    localFeatures.allowVoiceRecordings ??
    setup.property?.widgetSettings?.allowVoiceRecordings ??
    true

  const handleFeatureToggle = async (
    field: 'allowFileUpload' | 'allowVoiceRecordings',
    checked: boolean,
  ) => {
    if (!setup.property) return

    // 1. Optimistic local update
    setLocalFeatures((prev) => ({
      ...prev,
      [field]: checked,
    }))

    try {
      setIsUpdating(true)

      const nextUploadValue =
        field === 'allowFileUpload' ? checked : allowFileUpload
      const nextVoiceValue =
        field === 'allowVoiceRecordings' ? checked : allowVoiceRecordings

      const res = await updateWebsite({
        name: setup.property.name,
        domain: setup.property.domain,
        aiName: setup.property.widgetSettings?.aiName ?? 'AI Assistant',
        allowedDomains: setup.property.allowedDomains,
        category: setup.property.details?.category ?? '',
        subCategory: setup.property.details?.subCategory ?? '',
        region: setup.property.details?.region ?? '',
        description: setup.property.details?.description ?? '',
        logoUrl: setup.property.details?.logoUrl ?? '',
        widgetSettings: {
          allowFileUpload: nextUploadValue,
          allowVoiceRecordings: nextVoiceValue,
        },
      })

      // 2. 🎯 Synchronize the newly updated data right back into the dashboard cache!
      if (res?.success && res.data?.property) {
        updateCachedProperty(res.data.property)
      }
    } catch (err) {
      console.error('[Setup Settings] Error saving permissions mutation:', err)

      // Rollback to previous state on failure
      setLocalFeatures((prev) => ({
        ...prev,
        [field]: !checked,
      }))
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 md:p-4">
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

      {!setup.isNotRegistered && setup.property && (
        <div className={isUpdating ? 'opacity-80 pointer-events-none' : ''}>
          <WidgetFeatureCard
            key={setup.property._id}
            allowFileUpload={allowFileUpload}
            allowVoiceRecordings={allowVoiceRecordings}
            onToggleUpload={(checked) =>
              handleFeatureToggle('allowFileUpload', checked)
            }
            onToggleVoice={(checked) =>
              handleFeatureToggle('allowVoiceRecordings', checked)
            }
          />
        </div>
      )}

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