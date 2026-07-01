// /app/components/dashboard/settings/WorkspaceForm.tsx

'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
  Badge,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi'

import { useWorkspace } from '@/app/hooks/settings/useWorkspace'
import { getErrorMessage } from '@/app/lib/utils/error'
import {
  WorkspaceFormValues,
  workspaceSchema,
} from '@/app/lib/validation/settings/settings.schema'

export default function WorkspaceForm() {
  const { workspace, loading, saving, saveWorkspace } = useWorkspace()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
    },
  })

  useEffect(() => {
    if (workspace) {
      reset({
        companyName: workspace.companyName,
      })
    }
  }, [workspace, reset])

  const onSubmit = async (values: WorkspaceFormValues) => {
    try {
      await saveWorkspace(values)
      reset(values) // Marks the workspace form clean (isDirty = false) on complete save

      notifications.show({
        title: 'Workspace Updated',
        message: 'Your organization details have been saved successfully.',
        color: 'green',
        icon: <FiCheck size={16} />,
        autoClose: 4000,
      })
    } catch (error: unknown) {
      notifications.show({
        title: 'Save Failed',
        message: getErrorMessage(error), 
        color: 'red',
        icon: <FiAlertCircle size={16} />,
        autoClose: 5000,
      })
    }
  }

  if (loading) {
    return (
      <Card className="bg-card! flex justify-center items-center p-6">
        <Text size="sm" c="dimmed">
          Loading workspace information...
        </Text>
      </Card>
    )
  }

  return (
    <Card
      className="bg-card! border border-border! text-foreground!"
      radius="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="lg">
          {/* Header */}
          <div>
            <Title order={3}>Workspace</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Manage your organization details
            </Text>
          </div>

          <Divider className="border-border!" />

          {/* Plan display */}
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              Current Plan
            </Text>

            <Badge color="blue" variant="light">
              {workspace?.plan ?? 'free'}
            </Badge>
          </Group>

          <Divider className="border-border!" />

          {/* Form */}
          <TextInput
            label="Company Name"
            placeholder="Acme Inc."
            error={errors.companyName?.message}
            classNames={{
              input:
                'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
            }}
            {...register('companyName')}
          />

          <Divider className="border-border!" />

          {/* Submit */}
          <Group justify="flex-end">
            <Button
              type="submit"
              leftSection={<FiSave />}
              disabled={!isDirty || !isValid || saving}
              loading={saving}
              className="bg-primary! text-white!"
            >
              Save Workspace
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}