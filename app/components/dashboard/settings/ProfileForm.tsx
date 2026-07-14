// /app/components/dashboard/settings/ProfileForm.tsx


'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Avatar,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { FiCamera, FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi'

import { useProfile } from '@/app/hooks/settings/useProfile'
import { ProfileFormValues, profileSchema } from '@/app/lib/validation/settings/settings.schema'
import { getErrorMessage, getSuccessMessage } from '@/app/lib/utils/error'

export default function ProfileForm() {
  const { profile, saving, saveProfile } = useProfile()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    // 🎯 Set initial baseline from Zustand once on component mount
    defaultValues: profile, 
  })

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const response = await saveProfile(values)
      
      // 🎯 Only reset on successful form submission to make the form clean again
      reset(values) 

      notifications.show({
        title: 'Profile Updated',
        message: getSuccessMessage(response) || 'Your profile configuration was saved successfully.',
        color: 'green',
        icon: <FiCheck size={16} />,
        autoClose: 4000,
      })
    } catch (error: unknown) {
      notifications.show({
        title: 'Update Failed',
        message: getErrorMessage(error), 
        color: 'red',
        icon: <FiAlertCircle size={16} />,
        autoClose: 5000,
      })
    }
  }

  return (
    <Card
      radius="lg"
      shadow="sm"
      className="bg-card! border border-border! text-foreground!"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="xl">
          <div>
            <Title order={3}>Profile Information</Title>
            <Text c="dimmed" size="sm" mt={4}>
              Update your profile information.
            </Text>
          </div>

          <Divider className="border-border!" />

          <Group align="flex-start">
            <Avatar src={profile?.avatar || undefined} radius="xl" size={100} />

            <Stack gap={6}>
              <Button
                variant="light"
                className="bg-background! text-foreground! border border-border!"
                leftSection={<FiCamera />}
                disabled
              >
                Upload Avatar
              </Button>

              <Text size="xs" c="dimmed">
                Avatar upload will be enabled later.
              </Text>
            </Stack>
          </Group>

          <Divider className="border-border!" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInput
              label="First Name"
              placeholder="John"
              error={errors.firstName?.message}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
              {...register('firstName')}
            />

            <TextInput
              label="Last Name"
              placeholder="Doe"
              error={errors.lastName?.message}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
              {...register('lastName')}
            />

            <TextInput
              label="Email Address"
              placeholder="john@example.com"
              error={errors.email?.message}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
              className="md:col-span-2"
              {...register('email')}
            />

            <TextInput
              label="Avatar URL"
              placeholder="https://..."
              error={errors.avatar?.message}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
              className="md:col-span-2"
              {...register('avatar')}
            />
          </div>

          <Divider className="border-border!" />

          <Group justify="flex-end">
            <Button
              type="submit"
              leftSection={<FiSave />}
              loading={saving}
              disabled={!isDirty || !isValid}
              className="bg-primary! text-white!"
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}