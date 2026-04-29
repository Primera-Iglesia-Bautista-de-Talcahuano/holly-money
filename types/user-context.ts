import type { UserRole } from "@/types/auth"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: string
  permissions: string[]
}
