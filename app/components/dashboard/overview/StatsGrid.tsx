'use client'

import { SimpleGrid } from '@mantine/core'

import {
  FiActivity,
  FiClock,
  FiCpu,
  FiGlobe,
  FiMessageSquare,
  FiUsers,
} from 'react-icons/fi'

import StatCard from './StatCard'
import { OperatorData } from '@/app/lib/api/operators.api'
import { AccountData } from '@/app/types/auth'


interface StatsGridProps {
  operators: OperatorData[]
  account: AccountData | null
}


export default function StatsGrid({
  operators,
  account
}: StatsGridProps) {
  const onlineOperatorsCount = operators.filter(
    (operator) => operator.isOnline,
  ).length
  return (
    <SimpleGrid
      cols={{
        base: 2,
        sm: 3,
        lg: 3,
        xl: 6,
      }}
      spacing="md"
    >
      <StatCard
        title="Active Visitors"
        value={2}
        subtitle="Currently browsing"
        icon={<FiUsers size={22} />}
        color="blue"
      />

      <StatCard
        title="Active Chats"
        value={10}
        subtitle="Live conversations"
        icon={<FiMessageSquare size={22} />}
        color="indigo"
      />

      <StatCard
        title="Operators Online"
        value={onlineOperatorsCount}
        subtitle="Available agents"
        icon={<FiActivity size={22} />}
        color="green"
      />

      <StatCard
        title="Avg Response"
        value={20}
        subtitle="First reply"
        icon={<FiClock size={22} />}
        color="orange"
      />

      <StatCard
        title="AI Resolution"
        value={`${12}%`}
        subtitle="Resolved by AI"
        icon={<FiCpu size={22} />}
        color="cyan"
        progress={12}
      />

      <StatCard
        title="Website Status"
        value={account?.isActive ? 'Online' : 'Offline'}
        subtitle="Widget availability"
        icon={<FiGlobe size={22} />}
        color={account?.isActive  ? 'green' : 'red'}
        progress={account?.isActive  ? 100 : 0}
      />
    </SimpleGrid>
  )
}
