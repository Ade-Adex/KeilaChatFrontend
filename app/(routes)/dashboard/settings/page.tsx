// app/dashboard/settings/page.tsx

'use client'

import { Tabs, Title } from '@mantine/core'

import ProfileForm from '@/app/components/dashboard/settings/ProfileForm'
import WorkspaceForm from '@/app/components/dashboard/settings/WorkspaceForm'
import WebsiteForm from '@/app/components/dashboard/settings/WebsiteForm'

export default function SettingsPage() {
  return (
    <div className="md:px-8">
      <Title order={2} mb="lg">
        Settings
      </Title>

      <Tabs defaultValue="profile" variant="pills">
        <Tabs.List>
          <Tabs.Tab
            value="profile"
            classNames={{
              tab: 'hover:bg-button-hover! data-[active=true]:bg-primary! data-[active=true]:text-white',
            }}
          >
            Profile
          </Tabs.Tab>

          <Tabs.Tab
            value="workspace"
            classNames={{
              tab: 'hover:bg-button-hover! data-[active=true]:bg-primary! data-[active=true]:text-white',
            }}
          >
            Workspace
          </Tabs.Tab>

          <Tabs.Tab
            value="website"
            classNames={{
              tab: 'hover:bg-button-hover! data-[active=true]:bg-primary! data-[active=true]:text-white',
            }}
          >
            Website
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" pt="lg">
          <ProfileForm />
        </Tabs.Panel>

        <Tabs.Panel value="workspace" pt="lg">
          <WorkspaceForm />
        </Tabs.Panel>

        <Tabs.Panel value="website" pt="lg">
          <WebsiteForm />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}