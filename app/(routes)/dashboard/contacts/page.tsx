// /app/(routes)/admin/dashboard/contacts/page.tsx


'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useOperatorsStore } from '@/app/store/useOperatorsStore' 
import { useOperators } from '@/app/hooks/operators/useOperators' 
import { useInviteOperator } from '@/app/hooks/operators/useInviteOperator' 
import {
  TextInput,
  Select,
  MultiSelect,
  Button,
  Table,
  Paper,
  Title,
  Group,
  Modal,
  Badge,
  Text,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  FiPlus,
  FiUser,
  FiMail,
  FiShield,
  FiCheckCircle,
  FiClock,
} from 'react-icons/fi'

export default function ContactsPage() {
  const operator = useAuthStore((state) => state.operator)
  const isAdmin = operator?.role === 'admin'

  const [opened, { open, close }] = useDisclosure(false)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'supervisor' | 'agent'>('agent')
  const [assignedProperties, setAssignedProperties] = useState<string[]>([])

  // 🎯 Clean Facaded Hook States (Shared Caching Powered by Zustand underneath!)
  const { operators, loading, refreshOperators } = useOperators()
  const { sendInvite, loading: submitLoading, error } = useInviteOperator()
  
  // Keep properties cache inside the store context
  const { properties, fetchProperties } = useOperatorsStore()

  useEffect(() => {
    if (isAdmin) {
      Promise.resolve().then(() => {
        void fetchProperties()
      })
    }
  }, [isAdmin, fetchProperties])

  const handleInviteOperator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const success = await sendInvite(email, role, assignedProperties)
    if (!success) return

    setEmail('')
    setRole('agent')
    setAssignedProperties([])
    close()

    await refreshOperators() // Triggers the store to fetch fresh data
  }

  return (
    <div className="md:p-6 max-w-6xl mx-auto space-y-6">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2} className="tracking-tight text-foreground">
            Team Operators
          </Title>
          <Text size="sm" c="dimmed">
            Invite support agents and administrators to your workspace.
          </Text>
        </div>

        {isAdmin && (
          <Button
            leftSection={<FiPlus size={16} />}
            onClick={open}
            className="bg-primary! hover:bg-button-hover text-white"
          >
            Invite Operator
          </Button>
        )}
      </Group>

      {isAdmin && (
        <Modal
          opened={opened}
          onClose={close}
          title="Send Operator Invitation"
          centered
          size="md"
          styles={{
            content: {
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border, #262626)',
            },
            header: {
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            },
          }}
          className="bg-card! border-border!"
        >
          <form onSubmit={handleInviteOperator} className="space-y-4 pt-2">
            {error && (
              <Paper p="xs" bg="red" radius="sm">
                <Text size="xs" c="white">
                  {error}
                </Text>
              </Paper>
            )}

            <TextInput
              label="Email Address"
              placeholder="jane@company.com"
              required
              type="email"
              leftSection={<FiMail size={16} />}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <Select
              label="System Permissions Role"
              value={role}
              onChange={(value) =>
                setRole((value as 'admin' | 'supervisor' | 'agent') || 'agent')
              }
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
                dropdown: 'bg-card! text-foreground! border border-border!',
              }}
              data={[
                { value: 'agent', label: 'Support Agent' },
                { value: 'supervisor', label: 'Supervisor' },
                { value: 'admin', label: 'Administrator' },
              ]}
              leftSection={<FiShield size={16} />}
            />

            <MultiSelect
              label="Assign Properties"
              placeholder="Select one or more properties"
              value={assignedProperties}
              onChange={setAssignedProperties}
              searchable
              clearable
              data={properties.map((property) => ({
                value: property._id,
                label: `${property.name} (${property.domain})`,
              }))}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
                dropdown: 'bg-card! text-foreground! border border-border!',
              }}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={close} color="gray">
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitLoading}
                className="bg-primary hover:bg-primary/70 text-white"
              >
                Send Invite Link
              </Button>
            </Group>
          </form>
        </Modal>
      )}

      <Paper
        withBorder
        radius="md"
        className="overflow-hidden bg-background! border border-border!"
      >
        <Table.ScrollContainer minWidth={700}>
          <Table
            verticalSpacing="sm"
            highlightOnHover
            horizontalSpacing="md"
            className="min-w-full"
          >
            <Table.Thead className="bg-button-hover!">
              <Table.Tr className="hover:bg-button-hover! border border-border!">
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {operators.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4} className="py-8 text-center">
                    {loading ? 'Fetching operators...' : 'No operators found.'}
                  </Table.Td>
                </Table.Tr>
              ) : (
                operators.map((op) => (
                  <Table.Tr
                    key={op._id}
                    className="border border-border! hover:bg-button-hover!"
                  >
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <FiUser className="shrink-0" />
                        <Text size="sm" lineClamp={1}>
                          {op.firstName || op.lastName
                            ? `${op.firstName ?? ''} ${op.lastName ?? ''}`
                            : 'Pending Registration'}
                        </Text>
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" className="break-all whitespace-nowrap">
                        {op.email}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        variant="light"
                        color={
                          op.role === 'admin'
                            ? 'blue'
                            : op.role === 'supervisor'
                              ? 'violet'
                              : 'gray'
                        }
                      >
                        {op.role}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        {op.status === 'active' ? (
                          <>
                            <FiCheckCircle
                              size={14}
                              className="text-emerald-500 shrink-0"
                            />
                            <Text
                              size="xs"
                              className="font-medium text-emerald-500 whitespace-nowrap"
                            >
                              {op.isOnline ? 'Online' : 'Active'}
                            </Text>
                          </>
                        ) : (
                          <>
                            <FiClock
                              size={14}
                              className="text-amber-500 shrink-0"
                            />
                            <Text
                              size="xs"
                              className="font-medium text-amber-500 whitespace-nowrap"
                            >
                              Pending Invite
                            </Text>
                          </>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </div>
  )
}