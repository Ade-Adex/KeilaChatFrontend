// /app/components/dashboard/Sidebar.tsx

'use client'

import { NavLink, Tooltip } from '@mantine/core'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuthStore } from '@/app/store/useAuthStore'
import { FiLogOut } from 'react-icons/fi'
import { sidebarLinks } from '@/app/data/SidebarLinks'

interface SidebarProps {
  isOpened: boolean
}



export default function Sidebar({ isOpened }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter() 
  const logout = useAuthStore((state) => state.logout)

 const handleLogoutClick = async () => {
   try {
     await logout()

     router.replace('/signin')

     router.refresh()
   } catch (err) {
     console.error(err)
   }
 }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-3 justify-between text-white">
      {/* Main Navigation links mapping container */}
      <div className="flex flex-col gap-2">
        {sidebarLinks.map((link) => {
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
                label={isOpened ? link.name : null}
                leftSection={link.icon}
                className={`rounded-lg font-medium transition-all duration-200 py-2.5! ${
                  isActive
                    ? ' bg-primary! hover:opacity-80 shadow-sm'
                    : 'bg-sidebar/70! text-foreground opacity-80 hover:opacity-70!'
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
        })}
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