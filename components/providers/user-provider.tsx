"use client"

import { createContext, useContext, useMemo } from "react"
import type { SessionUser } from "@/types/user-context"

type UserContextValue = Omit<SessionUser, "permissions"> & {
  permissions: Set<string>
  can: (permission: string) => boolean
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({
  user,
  children
}: {
  user: SessionUser
  children: React.ReactNode
}) {
  const value = useMemo(() => {
    const permSet = new Set(user.permissions)
    return { ...user, permissions: permSet, can: (p: string) => permSet.has(p) }
  }, [user])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used inside UserProvider")
  return ctx
}
