'use client'

import { AccountData } from '@/app/types/account'
import { OperatorData } from '@/app/types/operator'
import {
  Badge,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'

import { FiActivity, FiCpu, FiGlobe } from 'react-icons/fi'

interface DashboardHeroProps {
  user: OperatorData | null
  account: AccountData | null
}
export default function DashboardHero({
  user, account
}: DashboardHeroProps) {
  const greeting = (() => {
    const hour = new Date().getHours()

    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'

    return 'Good evening'
  })()

  return (
    <Paper withBorder radius="lg" p="xl" className="bg-card! border-border!">
      <Group justify="space-between" align="flex-start" className=''>
        <Stack gap={6}>
          <Title order={2} className='text-foreground!'>
            {greeting}, {user?.firstName} 👋
          </Title>

          <Text c="dimmed" className='text-sm!'>
            Welcome back to <strong>{account?.name}</strong>. Here&apos;s
            the latest activity across your live chat platform.
          </Text>
        </Stack>

        <Group gap="sm" className='my-auto'>
          <Badge
            leftSection={<FiActivity size={14} />}
            color={account?.isActive ? 'green' : 'red'}
            variant="light"
            size="sm"
          >
            {account?.isActive ? 'Website Online' : 'Website Offline'}
          </Badge>

          <Badge
            leftSection={<FiCpu size={14} />}
            color={account?.settings.aiEnabled ? 'blue' : 'gray'}
            variant="light"
            size="sm"
          >
            {account?.settings.aiEnabled ? 'AI Enabled' : 'AI Disabled'}
          </Badge>

          <Badge
            leftSection={<FiGlobe size={14} />}
            color="violet"
            variant="light"
            size="sm"
          >
            {account?.plan.toUpperCase()}
          </Badge>
        </Group>
      </Group>
    </Paper>
  )
}
