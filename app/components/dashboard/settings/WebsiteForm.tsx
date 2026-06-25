// /app/components/dashboard/settings/WebsiteForm.tsx

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
  Textarea,
  Title,
} from '@mantine/core'

import { FiGlobe, FiSave } from 'react-icons/fi'

import { useWebsite } from '@/app/hooks/settings/useWebsite'

import {
  websiteSchema,
  type WebsiteFormValues,
} from '@/app/lib/validation/settings/settings.schema'

export default function WebsiteForm() {
  const { website, loading, saving, saveWebsite } = useWebsite()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, isDirty, isValid },
  } = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    mode: 'onChange',

    defaultValues: {
      name: '',
      domain: '',
      category: '',
      subCategory: '',
      region: '',
      description: '',
      logoUrl: '',
      allowedDomains: '',
    },
  })

  useEffect(() => {
    if (website) {
      reset(website)
    }
  }, [website, reset])

  const onSubmit = async (values: WebsiteFormValues) => {
    await saveWebsite(values)
    reset(values)
  }

  if (loading) {
    return (
      <Card className="bg-card! flex justify-center items-center">
        <Text>Loading website...</Text>
      </Card>
    )
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
