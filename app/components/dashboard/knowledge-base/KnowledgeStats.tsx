// /app/components/dashboard/knowledge-base/KnowledgeStats.tsx

'use client'

import { SimpleGrid, Paper, Group, Text } from '@mantine/core'
import { FiBookOpen, FiCpu, FiPercent } from 'react-icons/fi'

interface KnowledgeStatsProps {
  faqCount: number
  isAiEnabled: boolean
  threshold: number
}

export default function KnowledgeStats({
  faqCount,
  isAiEnabled,
  threshold,
}: KnowledgeStatsProps) {
  const stats = [
    {
      label: 'Total Trained FAQs',
      value: faqCount,
      icon: FiBookOpen,
      color: 'blue',
    },
    {
      label: 'Engine Status',
      value: isAiEnabled ? 'Active' : 'Offline',
      icon: FiCpu,
      color: isAiEnabled ? 'green' : 'gray',
    },
    {
      label: 'Match Precision',
      value: `${threshold}%`,
      icon: FiPercent,
      color: 'purple',
    },
  ]

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} className='gap-2'>
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Paper
            key={idx}
            withBorder
            radius="md"
            p="md"
            className="bg-card! border-border!"
          >
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={500} tt="uppercase">
                  {stat.label}
                </Text>
                <Text fw={700} size="xl" className="text-foreground mt-1">
                  {stat.value}
                </Text>
              </div>
              <div
                className={`p-2 rounded-md bg-${stat.color}-500/10 text-${stat.color}-500`}
              >
                <Icon size={20} />
              </div>
            </Group>
          </Paper>
        )
      })}
    </SimpleGrid>
  )
}