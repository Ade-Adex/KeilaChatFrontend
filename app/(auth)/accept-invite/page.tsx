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
import { useAcceptInvite } from '@/app/hooks/operators/useAcceptInvite'

function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get('token')

  const { verifyToken, activateAccount, verifying, submitting } =
    useAcceptInvite()

  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  /**
   * Avoid calling setState synchronously inside useEffect
   */
  const tokenError = !token
    ? 'No secure invitation token was detected in the request URL.'
    : ''

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!token || loaded) return

    let mounted = true

    const loadInvite = async () => {
      try {
        const res = await verifyToken(token)

        if (!mounted) return

        setEmail(res.data.email)
        setRole(res.data.role)
        setLoaded(true)
      } catch (err) {
        if (!mounted) return

        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'This invitation token is invalid or has expired.',
        )
      }
    }

    void loadInvite()

    return () => {
      mounted = false
    }
  }, [token, loaded, verifyToken])


  const handleActivationSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()

    setErrorMsg('')

    if (!token) {
      setErrorMsg('Invitation token missing.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      return
    }

    try {
      await activateAccount(token, firstName.trim(), lastName.trim(), password)

      setSuccess(true)

      setTimeout(() => {
        router.push('/signin')
      }, 3000)
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to complete profile activation.',
      )
    }
  }

  const displayError = tokenError || errorMsg

  if (verifying) {
    return (
      <Center className="min-h-screen bg-background text-foreground">
        <Stack align="center" gap="md">
          <Loader size="lg" color="blue" />
          <Text size="sm" c="dimmed">
            Verifying your team invitation credentials...
          </Text>
        </Stack>
      </Center>
    )
  }

  const inviteInvalid =
    !token ||
    displayError.includes('invalid') ||
    displayError.includes('expired')

  const inputClassNames = {
    input:
      'border border-border! rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary! transition-colors text-foreground! bg-transparent!',
  }

  return (
    <Center className="min-h-screen p-4 pt-20 bg-background text-foreground">
      <Paper
        withBorder
        p="xl"
        radius="md"
        className="w-full max-w-md shadow-sm border-border! bg-background!"
      >
        {success ? (
          <Stack
            align="center"
            gap="sm"
            className="py-4 text-center bg-background! text-foreground!"
          >
            <FiCheckCircle size={48} className="text-emerald-500" />
            <Title order={3} className="text-foreground!">
              Profile Activated!
            </Title>
            <Text size="sm" c="dimmed">
              Welcome aboard. Your operator profile is now fully configured.
              Redirecting you to sign in...
            </Text>
          </Stack>
        ) : (
          <form onSubmit={handleActivationSubmit}>
            <Stack gap="md">
              <div>
                <Title
                  order={2}
                  className="tracking-tight text-center text-foreground! mb-3!"
                >
                  Complete Setup
                </Title>
                <Text size="sm" c="dimmed">
                  You are joining the ecosystem as an{' '}
                  <strong className="text-foreground">{role}</strong>.
                </Text>

                <TextInput
                  label="Invitation Email"
                  value={email}
                  disabled
                  classNames={{
                    input:
                      'border border-border! rounded-lg bg-transparent! text-foreground!',
                  }}
                />
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

              {inviteInvalid ? (
                <Button
                  variant="subtle"
                  // color="gray"
                  fullWidth
                  onClick={() => router.push('/signin')}
                  className='text-white! bg-primary!'
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
                      classNames={inputClassNames}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      leftSection={<FiUser size={14} />}
                    />
                    <TextInput
                      label="Last Name"
                      placeholder="Doe"
                      required
                      classNames={inputClassNames}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      leftSection={<FiUser size={14} />}
                    />
                  </div>

                  <PasswordInput
                    label="Create Password"
                    placeholder="Minimum 8 characters"
                    required
                    classNames={inputClassNames}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftSection={<FiLock size={14} />}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Repeat chosen password"
                    required
                    classNames={inputClassNames}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftSection={<FiLock size={14} />}
                  />

                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={
                      !firstName || !lastName || !password || !confirmPassword
                    }
                    fullWidth
                    mt="md"
                    className="bg-primary! hover:bg-primary/85! text-white h-10"
                  >
                    Activate Account
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
          <Loader size="lg" color="blue" />
        </Center>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  )
}
