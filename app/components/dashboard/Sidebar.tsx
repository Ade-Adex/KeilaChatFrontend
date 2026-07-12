// /app/components/dashboard/Sidebar.tsx

'use client'

import { NavLink, Tooltip } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuthStore } from '@/app/store/useAuthStore'
import { FiLogOut } from 'react-icons/fi'
import { sidebarLinks } from '@/app/data/SidebarLinks'
import { useAuthorization } from '@/app/hooks/useAuthorization'
import { SidebarPermissions } from '@/app/lib/auth/sidebarPermissions'

interface SidebarProps {
  isOpened: boolean
  onNavigate: () => void
}

export default function Sidebar({ isOpened, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((state) => state.logout)

  const handleLogoutClick = async () => {
    try {
      onNavigate()

      await logout()

      router.replace('/signin')
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  const { can } = useAuthorization()

  const visibleLinks = sidebarLinks.filter((link) => {
    const permission =
      SidebarPermissions[link.name as keyof typeof SidebarPermissions]

    if (!permission) return true

    return can(permission)
  })

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-3 justify-between text-white">
      {/* Main Navigation links mapping container */}
      <div className="flex flex-col gap-2">
        {
          /* sidebarLinks.map */ visibleLinks.map((link) => {
            const isActive = pathname === link.href

            return (
              <Tooltip
                key={link.name}
                label={link.name}
                disabled={isOpened}
                position="right"
                withArrow
                transitionProps={{ transition: 'fade', duration: 150 }}
              >
                <NavLink
                  component={Link}
                  href={link.href}
                  onClick={onNavigate}
                  label={isOpened ? link.name : null}
                  leftSection={link.icon}
                  className={`relative rounded-lg py-2.5! transition-all duration-300
                ${
                  isActive
                    ? 'text-primary! font-semibold after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary'
                    : 'text-foreground! hover:text-primary after:absolute after:left-1/2 after:-bottom-0.5 after:h-0.5 after:w-0 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300 hover:after:w-[70%]'
                }`}
                  styles={{
                    root: {
                      paddingLeft: isOpened ? 12 : 14,
                      backgroundColor: 'transparent',
                    },
                    label: { fontSize: '14px' },
                    section: { color: 'currentColor' },
                  }}
                />
              </Tooltip>
            )
          })
        }
      </div>

      {/* Footer Segment: Boundary Divider + Logout Action */}
      <div className="flex flex-col gap-2">
        <div className="border-t border-border w-full my-1" />

        <Tooltip label="Logout" disabled={isOpened} position="right" withArrow>
          <NavLink
            onClick={handleLogoutClick}
            label={isOpened ? 'Logout' : null}
            leftSection={<FiLogOut size={18} />}
            className="text-red-600! dark:text-red-400! font-medium hover:bg-red-50! dark:hover:bg-red-950/30! rounded-lg transition-all duration-200 py-2.5!"
            styles={{
              root: {
                paddingLeft: isOpened ? 12 : 14,
                backgroundColor: 'transparent',
              },
              label: { fontSize: '14px', color: 'currentColor' },
              section: { color: 'currentColor' },
            }}
          />
        </Tooltip>
      </div>
    </div>
  )
}
