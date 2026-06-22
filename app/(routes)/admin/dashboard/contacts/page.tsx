// app/(routes)/admin/dashboard/contacts/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/app/store/useAuthStore'
import {
  TextInput,
  Select,
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

interface OperatorData {
  _id: string
  firstName?: string
  lastName?: string
  email: string
  role: 'admin' | 'agent'
  isOnline: boolean
  status: 'active' | 'invited'
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL


export default function ContactsPage() {
  const authUser = useAuthStore((state) => state.user)
  const tenantAccountId = authUser?.accountId || authUser?.id

  const [opened, { open, close }] = useDisclosure(false)
  const [operators, setOperators] = useState<OperatorData[]>([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string | null>('agent')

  const fetchOperators = async () => {
    if (!tenantAccountId) return
    setLoading(true)
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/operators?accountId=${tenantAccountId}`,
      )
      const json = await res.json()
      if (json.status === 'success') {
        setOperators(json.data)
      }
    } catch (err) {
      console.error('Error fetching operators:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperators()
  }, [tenantAccountId])

  const handleInviteOperator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantAccountId) return

    setErrorMsg('')
    setSubmitLoading(true)

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/operators/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: tenantAccountId,
          email,
          role,
        }),
      })

      const data = await response.json()

      if (response.ok && data.status === 'success') {
        setEmail('')
        setRole('agent')
        close()
        fetchOperators()
      } else {
        setErrorMsg(
          data.message || 'Failed to dispatch operator team invitation.',
        )
      }
    } catch (err) {
      setErrorMsg('Network error encountered.')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Group justify="space-between" align="center">
        <div>
          <Title
            order={2}
            className="tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Team Operators
          </Title>
          <Text size="sm" c="dimmed">
            Invite support agents to your ecosystem. Users will receive an email
            link to sign up or log in.
          </Text>
        </div>
        <Button
          leftSection={<FiPlus size={16} />}
          onClick={open}
          className="bg-primary hover:bg-button-hover text-white"
        >
          Invite Operator
        </Button>
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        title="Send Operator Invitation"
        centered
        size="md"
        className="bg-background!"
      >
        <form onSubmit={handleInviteOperator} className="space-y-4 pt-2">
          {errorMsg && (
            <Paper p="xs" bg="red.9" radius="sm">
              <Text size="xs" color="white">
                {errorMsg}
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
            onChange={(e) => setEmail(e.target.value)}
          />

          <Select
            label="System Permissions Role"
            data={[
              { value: 'agent', label: 'Support Agent (Chat Access Only)' },
              { value: 'admin', label: 'Administrator (Full Access)' },
            ]}
            value={role}
            onChange={setRole}
            leftSection={<FiShield size={16} />}
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={close} color="gray">
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitLoading}
              className="bg-primary hover:bg-button-hover text-white"
            >
              Send Invite Link
            </Button>
          </Group>
        </form>
      </Modal>

      <Paper
        withBorder
        radius="md"
        className="overflow-hidden bg-background! border border-border!"
      >
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead className="bg-button-hover">
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {operators.length === 0 ? (
              <Table.Tr className="hover:bg-button-hover!">
                <Table.Td
                  colSpan={4}
                  className="text-center py-8 text-foreground "
                >
                  {loading
                    ? 'Fetching team configuration details...'
                    : 'No operators or pending invitations found.'}
                </Table.Td>
              </Table.Tr>
            ) : (
              operators.map((op) => (
                <Table.Tr key={op._id} className="hover:bg-button-hover!">
                  <Table.Td className="font-medium">
                    <Group gap="xs">
                      <FiUser className="text-foreground" />
                      <Text size="sm">
                        {op.firstName && op.lastName
                          ? `${op.firstName} ${op.lastName}`
                          : 'Pending Registration'}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{op.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={op.role === 'admin' ? 'blue' : 'gray'}
                      variant="light"
                      className="text-foreground! bg-button-hover!"
                    >
                      {op.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {op.status === 'active' ? (
                        <>
                          <FiCheckCircle
                            size={14}
                            className="text-emerald-500"
                          />
                          <Text
                            size="xs"
                            className="text-emerald-500 font-medium"
                          >
                            {op.isOnline ? 'Online' : 'Active'}
                          </Text>
                        </>
                      ) : (
                        <>
                          <FiClock size={14} className="text-amber-500" />
                          <Text
                            size="xs"
                            className="text-amber-500 font-medium"
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
      </Paper>
    </div>
  )
}
