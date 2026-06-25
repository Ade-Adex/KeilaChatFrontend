'use client'

import { AccountData } from '@/app/types/account'
import { Badge, Divider, Group, Paper, Stack, Text, Title } from '@mantine/core'

import { FiCheckCircle, FiCpu, FiMail, FiShield, FiUsers } from 'react-icons/fi'

interface AccountSummaryProps {
  account: AccountData | null
}

export default function AccountSummary({ account }: AccountSummaryProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border-border! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Account Summary</Title>

          <Badge color={account?.isActive ? 'green' : 'red'} variant="light">
            {account?.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </Group>

        <Divider className="border-border!" />

        <InfoRow
          icon={<FiShield />}
          label="Workspace"
          value={account?.name || ''}
        />

        <InfoRow
          icon={<FiMail />}
          label="Owner"
          value={account?.ownerEmail || ''}
        />

        <InfoRow
          icon={<FiUsers />}
          label="Plan"
          value={account?.plan.toUpperCase() || ''}
        />

        <InfoRow
          icon={<FiUsers />}
          label="Max Operators"
          value={String(account?.settings.maxOperators ?? 0)}
        />

        <InfoRow
          icon={<FiUsers />}
          label="Max Visitors"
          value={String(account?.settings.maxVisitors ?? 0)}
        />

        <InfoRow
          icon={<FiCpu />}
          label="AI Enabled"
          value={account?.settings.aiEnabled ? 'Yes' : 'No'}
        />

        <InfoRow
          icon={<FiCheckCircle />}
          label="Created"
          value={
            account?.createdAt
              ? new Date(account.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : ''
          }
        />
      </Stack>
    </Paper>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: string
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Group justify="space-between">
      <Group gap="sm">
        {icon}

        <Text size="sm">{label}</Text>
      </Group>

      <Text size="sm" fw={600}>
        {value}
      </Text>
    </Group>
  )
}
