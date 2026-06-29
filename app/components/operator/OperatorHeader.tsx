// /components/operator/OperatorHeader.tsx

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { FaBell, FaCircle, FaMoon, FaSearch } from 'react-icons/fa'

import { getOperatorProfile } from '@/app/lib/api/chat.api'

import type { OperatorProfile } from '@/app/types/dashboard'

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
       if (mounted) {
         console.error(error)
       }
     } finally {
       if (mounted) {
         setLoading(false)
       }
     }
   }

   void fetchProfile()

   return () => {
     mounted = false
   }
 }, [])

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* left */}
      <div>
        <h1 className="text-lg font-bold">
          {profile?.account?.name ?? 'Workspace'}
        </h1>

        <p className="text-sm text-muted-foreground">Operator Dashboard</p>
      </div>

      {/* search */}
      <div className="hidden w-[400px] items-center rounded-lg border bg-background px-3 md:flex">
        <FaSearch className="text-muted-foreground" />

        <input
          type="text"
          placeholder="Search conversations..."
          className="h-10 w-full bg-transparent px-3 outline-none"
        />
      </div>

      {/* right */}
      <div className="flex items-center gap-5">
        {/* theme */}
        <button type="button" className="text-lg">
          <FaMoon />
        </button>

        {/* notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-lg"
        >
          <FaBell />

          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* presence */}
        <div className="flex items-center gap-2">
          <FaCircle
            className={`text-xs ${
              profile?.operator?.availabilityStatus === 'online'
                ? 'text-green-500'
                : profile?.operator?.availabilityStatus === 'busy'
                  ? 'text-red-500'
                  : profile?.operator?.availabilityStatus === 'away'
                    ? 'text-yellow-500'
                    : 'text-gray-400'
            }`}
          />

          <span className="text-sm capitalize">
            {profile?.operator?.availabilityStatus ?? 'offline'}
          </span>
        </div>

        {/* avatar */}
        <div className="flex items-center gap-3">
          {profile?.operator?.avatar ? (
            <Image
              src={profile.operator.avatar}
              alt="operator"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {profile?.operator?.firstName?.[0] ?? 'O'}
            </div>
          )}

          <div className="hidden md:block">
            <p className="font-medium">
              {profile?.operator?.firstName} {profile?.operator?.lastName}
            </p>

            <p className="text-xs capitalize text-muted-foreground">
              {profile?.operator?.role}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute right-4 top-4 text-xs text-muted-foreground">
          Loading...
        </div>
      )}
    </header>
  )
}