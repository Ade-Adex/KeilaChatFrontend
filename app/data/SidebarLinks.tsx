import {
  FiHome,
  FiMessageSquare,
  FiUsers,
  FiCode,
  FiSettings,
} from 'react-icons/fi'
import { size } from 'zod/v4/mini'

export const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: <FiHome size={18} /> },
  {
    name: 'Inbox',
    href: '/dashboard/inbox',
    icon: <FiMessageSquare size={18} />,
  },
  {
    name: 'Contacts',
    href: '/dashboard/contacts',
    icon: <FiUsers size={18} />,
  },
  { name: 'Setup', href: '/dashboard/setup', icon: <FiCode size={18} /> },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: <FiSettings size={18} />,
  },
]