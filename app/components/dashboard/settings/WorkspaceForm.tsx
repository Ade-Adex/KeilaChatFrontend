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
import { FiSave } from 'react-icons/fi'

import { useWorkspace } from '@/app/hooks/settings/useWorkspace'
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
    await saveWorkspace(values)
  }

  if (loading) {
    return (
      <Card className="bg-card! flex justify-center items-center">
        <Text>Loading...</Text>
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
            <Text size="sm" c="dimmed">
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
