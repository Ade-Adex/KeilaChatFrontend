// app/(routes)/admin/dashboard/accept-invite/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Center,
  Loader,
  Stack,
  Alert,
} from '@mantine/core'
import { FiUser, FiLock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  // UI State Control
  const [verifying, setVerifying] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  // Operator Context State
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  // Form Inputs
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // 1. Verify token validity immediately on mount
  useEffect(() => {
    if (!token) {
      setErrorMsg('No secure invitation token was detected in the request URL.')
      setVerifying(false)
      return
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(
          `/api/v1/operators/invite/verify?token=${token}`,
        )
        const json = await res.json()

        if (res.ok && json.status === 'success') {
          setEmail(json.data.email)
          setRole(json.data.role)
        } else {
          setErrorMsg(
            json.message || 'This invitation token is invalid or has expired.',
          )
        }
      } catch (err) {
        setErrorMsg('Network connectivity issue encountered during validation.')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  // 2. Submit password configuration payload
  const handleActivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/v1/operators/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
        }),
      })

      const json = await res.json()

      if (res.ok && json.status === 'success') {
        setSuccess(true)
        // Redirect to workspace login following a quick confirmation delay
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        setErrorMsg(json.message || 'Failed to complete profile activation.')
      }
    } catch (err) {
      setErrorMsg('A network error occurred while finalizing setup.')
    } finally {
      setSubmitting(false)
    }
  }

  if (verifying) {
    return (
      <Center className="min-h-screen bg-background text-foreground">
        <Stack align="center" gap="md">
          <Loader size="lg" color="dark" />
          <Text size="sm" c="dimmed">
            Verifying your team invitation credentials...
          </Text>
        </Stack>
      </Center>
    )
  }

  return (
    <Center className="min-h-screen p-4 bg-background text-foreground">
      <Paper
        withBorder
        p="xl"
        radius="md"
        className="w-full max-w-md shadow-sm border-border! bg-background!"
      >
        {success ? (
          <Stack align="center" gap="sm" className="py-4 text-center">
            <FiCheckCircle size={48} className="text-emerald-500" />
            <Title order={3} className="text-neutral-900 dark:text-neutral-50">
              Profile Activated!
            </Title>
            <Text size="sm" c="dimmed">
              Welcome aboard. Your operator profile is now fully configured.
              Redirecting you to login...
            </Text>
          </Stack>
        ) : (
          <form onSubmit={handleActivationSubmit}>
            <Stack gap="md">
              <div>
                <Title
                  order={2}
                  className="tracking-tight text-neutral-900 dark:text-neutral-50 mb-1"
                >
                  Complete Setup
                </Title>
                <Text size="sm" c="dimmed">
                  You are joining the ecosystem as an{' '}
                  <strong className="text-foreground">{role}</strong> via{' '}
                  <strong>{email}</strong>.
                </Text>
              </div>

              {errorMsg && (
                <Alert
                  icon={<FiAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  title="Action Needed"
                >
                  {errorMsg}
                </Alert>
              )}

              {!token ||
              errorMsg.includes('invalid') ||
              errorMsg.includes('expired') ? (
                <Button
                  variant="subtle"
                  color="gray"
                  fullWidth
                  onClick={() => router.push('/login')}
                >
                  Return to Login
                </Button>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="First Name"
                      placeholder="Jane"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      leftSection={<FiUser size={14} />}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      leftSection={<FiUser size={14} />}
                    />
                  </div>

                  <PasswordInput
                    label="Create Password"
                    placeholder="Minimum 8 characters"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftSection={<FiLock size={14} />}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Repeat chosen password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftSection={<FiLock size={14} />}
                  />

                  <Button
                    type="submit"
                    loading={submitting}
                    fullWidth
                    mt="md"
                    className="bg-primary hover:bg-button-hover text-white h-10"
                  >
                    Activate Operator Account
                  </Button>
                </>
              )}
            </Stack>
          </form>
        )}
      </Paper>
    </Center>
  )
}

// Next.js requires Client Components reading from useSearchParams to be wrapped in a Suspense boundary
export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <Center className="min-h-screen bg-background">
          <Loader size="lg" color="dark" />
        </Center>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}
