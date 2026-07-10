// // /components/operator/OperatorHeader.tsx

// import Image from 'next/image'
// import { useEffect, useState } from 'react'

// import { FaBell, FaCircle, FaMoon, FaSearch } from 'react-icons/fa'

// import { getOperatorProfile } from '@/app/lib/api/chat.api'

// import type { OperatorProfile } from '@/app/types/dashboard'

// export default function OperatorHeader() {
//   const [profile, setProfile] = useState<OperatorProfile | null>(null)

//   const [loading, setLoading] = useState(true)

//  useEffect(() => {
//    let mounted = true

//    const fetchProfile = async () => {
//      try {
//        const result = await getOperatorProfile()

//        if (mounted) {
//          setProfile(result.data)
//        }
//      } catch (error) {
//        if (mounted) {
//          console.error(error)
//        }
//      } finally {
//        if (mounted) {
//          setLoading(false)
//        }
//      }
//    }

//    void fetchProfile()

//    return () => {
//      mounted = false
//    }
//  }, [])

//   return (
//     <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
//       {/* left */}
//       <div>
//         <h1 className="text-lg font-bold">
//           {profile?.account?.name ?? 'Workspace'}
//         </h1>

//         <p className="text-sm text-muted-foreground">Operator Dashboard</p>
//       </div>

//       {/* search */}
//       <div className="hidden w-100 items-center rounded-lg border bg-background px-3 md:flex">
//         <FaSearch className="text-muted-foreground" />

//         <input
//           type="text"
//           placeholder="Search conversations..."
//           className="h-10 w-full bg-transparent px-3 outline-none"
//         />
//       </div>

//       {/* right */}
//       <div className="flex items-center gap-5">

//         {/* notifications */}
//         <button
//           type="button"
//           aria-label="Notifications"
//           className="relative text-lg"
//         >
//           <FaBell />

//           <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
//         </button>

//         {/* presence */}
//         <div className="flex items-center gap-2">
//           <FaCircle
//             className={`text-xs ${
//               profile?.operator?.availabilityStatus === 'online'
//                 ? 'text-green-500'
//                 : profile?.operator?.availabilityStatus === 'busy'
//                   ? 'text-red-500'
//                   : profile?.operator?.availabilityStatus === 'away'
//                     ? 'text-yellow-500'
//                     : 'text-gray-400'
//             }`}
//           />

//           <span className="text-sm capitalize">
//             {profile?.operator?.availabilityStatus ?? 'offline'}
//           </span>
//         </div>

//         {/* avatar */}
//         <div className="flex items-center gap-3">
//           {profile?.operator?.avatar ? (
//             <Image
//               src={profile.operator.avatar}
//               alt="operator"
//               width={40}
//               height={40}
//               className="h-10 w-10 rounded-full object-cover"
//               unoptimized
//             />
//           ) : (
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
//               {profile?.operator?.firstName?.[0] ?? 'O'}
//             </div>
//           )}

//           <div className="hidden md:block">
//             <p className="font-medium">
//               {profile?.operator?.firstName} {profile?.operator?.lastName}
//             </p>

//             <p className="text-xs capitalize text-muted-foreground">
//               {profile?.operator?.role}
//             </p>
//           </div>
//         </div>
//       </div>

//       {loading && (
//         <div className="absolute right-4 top-4 text-xs text-muted-foreground">
//           Loading...
//         </div>
//       )}
//     </header>
//   )
// }





// /components/operator/OperatorHeader.tsx

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FaBell, FaCircle, FaSearch } from 'react-icons/fa'
import { getOperatorProfile } from '@/app/lib/api/chat.api'
import type { OperatorProfile } from '@/app/types/dashboard'
import { getChatSocket } from '@/app/hooks/useChatSocket'

export default function OperatorHeader() {
  const [profile, setProfile] = useState<OperatorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async () => {
      try {
        const result = await getOperatorProfile()
        if (mounted) {
          setProfile(result.data)
        }
      } catch (error) {
        console.error('❌ Failed syncing profile content schema:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchProfile()

    // 🎯 SYNC STATE: If cron updates status dynamically over the wire, map changes live
    const socket = getChatSocket()
    const handlePresenceWireShift = (payload: { operatorId: string; availabilityStatus: string; isOnline: boolean }) => {
      if (profile?.operator?._id === payload.operatorId && mounted) {
        setProfile((prev) => {
          if (!prev || !prev.operator) return prev
          return {
            ...prev,
            operator: {
              ...prev.operator,
              // 🎯 FIXED: Cast the loose string payload to match the expected state literal union type cleanly
              availabilityStatus: payload.availabilityStatus as 'offline' | 'online' | 'away' | 'busy',
            },
          }
        })
      }
    }

    socket.on('operator_status_changed', handlePresenceWireShift)

    return () => {
      mounted = false
      socket.off('operator_status_changed', handlePresenceWireShift)
    }
  }, [profile?.operator?._id])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 relative">
      <div>
        <h1 className="text-lg font-bold">
          {profile?.account?.name ?? 'Workspace'}
        </h1>
        <p className="text-sm text-muted-foreground">Operator Dashboard</p>
      </div>

      <div className="hidden w-100 items-center rounded-lg border bg-background px-3 md:flex">
        <FaSearch className="text-muted-foreground" />
        <input
          type="text"
          placeholder="Search conversations..."
          className="h-10 w-full bg-transparent px-3 outline-none"
        />
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-lg cursor-pointer"
        >
          <FaBell />
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 select-none">
          <FaCircle
            className={`text-xs transition-colors duration-200 ${
              profile?.operator?.availabilityStatus === 'online'
                ? 'text-green-500'
                : profile?.operator?.availabilityStatus === 'busy'
                  ? 'text-red-500'
                  : profile?.operator?.availabilityStatus === 'away'
                    ? 'text-yellow-500'
                    : 'text-gray-400'
            }`}
          />
          <span className="text-sm capitalize font-medium">
            {profile?.operator?.availabilityStatus ?? 'offline'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {profile?.operator?.avatar ? (
            <Image
              src={profile.operator.avatar}
              alt="operator"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover border border-border"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-xs">
              {profile?.operator?.firstName?.[0] ?? 'O'}
            </div>
          )}

          <div className="hidden md:block">
            <p className="font-semibold text-sm">
              {profile?.operator?.firstName} {profile?.operator?.lastName}
            </p>
            <p className="text-xs capitalize text-muted-foreground font-medium">
              {profile?.operator?.role}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute right-4 top-4 text-[11px] font-medium text-muted-foreground animate-pulse">
          Syncing...
        </div>
      )}
    </header>
  )
}