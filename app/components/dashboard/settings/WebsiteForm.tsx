// /app/components/dashboard/settings/WebsiteForm.tsx
'use client'

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
  Textarea,
  Title,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { FiGlobe, FiSave, FiCheck, FiAlertCircle } from 'react-icons/fi'

import { useWebsite } from '@/app/hooks/settings/useWebsite'
import { getErrorMessage, getSuccessMessage } from '@/app/lib/utils/error'
import {
  websiteSchema,
  type WebsiteFormValues,
} from '@/app/lib/validation/settings/settings.schema'

export default function WebsiteForm() {
  const { website, saving, saveWebsite } = useWebsite()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    mode: 'onChange',
    // 🎯 Instant initial value configuration from global dashboard state store profile memory
    defaultValues: website,
  })

  const onSubmit = async (values: WebsiteFormValues) => {
    try {
      const response = await saveWebsite(values)
      reset(values)

      notifications.show({
        title: 'Settings Saved',
        message:
          getSuccessMessage(response) ||
          'Website settings updated successfully.',
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

  return (
    <Card
      radius="lg"
      shadow="sm"
      className="bg-card! border border-border! text-foreground!"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="xl">
          <div>
            <Title order={3}>Website</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Configure the website connected to your live chat widget.
            </Text>
          </div>

          <Divider className="border-border!" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextInput
              label="Website Name"
              leftSection={<FiGlobe size={16} />}
              error={errors.name?.message}
              {...register('name')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <TextInput
              label="Primary Domain"
              error={errors.domain?.message}
              {...register('domain')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <TextInput
              label="AI Bot Name"
              placeholder="AI Assistant"
              description="The name shown to customers when interacting with artificial intelligence."
              error={errors.aiName?.message}
              {...register('aiName')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <TextInput
              label="Category"
              error={errors.category?.message}
              {...register('category')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <TextInput
              label="Sub Category"
              error={errors.subCategory?.message}
              {...register('subCategory')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <TextInput
              label="Region"
              error={errors.region?.message}
              {...register('region')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <TextInput
              label="Logo URL"
              error={errors.logoUrl?.message}
              {...register('logoUrl')}
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
            />

            <Textarea
              label="Description"
              error={errors.description?.message}
              autosize
              minRows={4}
              className="md:col-span-2"
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
              {...register('description')}
            />

            <Textarea
              label="Allowed Domains"
              description="Enter one domain per line."
              error={errors.allowedDomains?.message}
              autosize
              minRows={5}
              className="md:col-span-2"
              classNames={{
                input:
                  'border border-border! outline-none! focus:border-primary! transition-colors! text-foreground! bg-transparent!',
              }}
              {...register('allowedDomains')}
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
              Save Website
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}
