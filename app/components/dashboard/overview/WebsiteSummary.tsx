'use client'

import {
  Badge,
  ColorSwatch,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'

import {
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiLink,
  FiMapPin,
  FiMonitor,
} from 'react-icons/fi'

import type { WebsiteSummaryProps } from '@/app/types/dashboard'

export default function WebsiteSummary({ property }: WebsiteSummaryProps) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="lg"
      className="bg-card! border border-border! text-foreground! h-full"
    >
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={4}>Website Summary</Title>

          <Badge
            color={property.settings.onlineStatus ? 'green' : 'red'}
            variant="light"
          >
            {property.settings.onlineStatus ? 'Online' : 'Offline'}
          </Badge>
        </Group>

        <Divider className="border-border!" />

        <InfoRow
          icon={<FiMonitor size={18} />}
          label="Website"
          value={property.name}
        />

        <InfoRow
          icon={<FiGlobe size={18} />}
          label="Domain"
          value={property.domain}
        />

        <InfoRow
          icon={<FiMapPin size={18} />}
          label="Category"
          value={property.details.category || 'Not specified'}
        />

        <InfoRow
          icon={<FiMapPin size={18} />}
          label="Region"
          value={property.details.region || 'Not specified'}
        />

        <InfoRow
          icon={<FiLink size={18} />}
          label="Widget ID"
          value={`${property.widgetId.slice(0, 12)}...`}
        />

        <Divider className="border-border!" />

        <Group grow>
          <StatusBadge title="AI" active={property.settings.aiEnabled} />

          <StatusBadge
            title="Auto Assign"
            active={property.settings.autoAssign}
          />

          <StatusBadge title="Track IP" active={property.settings.trackIp} />
        </Group>

        <Divider className="border-border!" />

        <Group justify="space-between">
          <Text fw={500}>Theme Color</Text>

          <ColorSwatch color={property.settings.themeColor} />
        </Group>

        <Group justify="space-between">
          <Text fw={500}>Working Hours</Text>

          <Badge
            leftSection={<FiClock size={12} />}
            variant="light"
            color={property.workingHours.enabled ? 'green' : 'gray'}
          >
            {property.workingHours.enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </Group>

        <Group justify="space-between">
          <Text fw={500}>Allowed Domains</Text>

          <Badge variant="outline">{property.allowedDomains.length}</Badge>
        </Group>
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
        <ThemeIcon variant="light" radius="xl">
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>

      <Text fw={600} size="sm" maw={180} truncate>
        {value}
      </Text>
    </Group>
  )
}

interface StatusBadgeProps {
  title: string
  active: boolean
}

function StatusBadge({ title, active }: StatusBadgeProps) {
  return (
    <Badge
      fullWidth
      variant="light"
      color={active ? 'green' : 'gray'}
      leftSection={<FiCheckCircle size={12} />}
    >
      {title}
    </Badge>
  )
}
