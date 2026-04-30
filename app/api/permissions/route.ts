import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { getPermissionMap, updatePermission } from "@/services/permissions/permissions.service"
import type { UserRole } from "@/types/auth"
import type { Permission } from "@/lib/permissions/rbac"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_SETTINGS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()
  const permMap = await getPermissionMap(supabase)

  const result: Record<string, Record<string, boolean>> = {}
  for (const [role, perms] of Object.entries(permMap)) {
    result[role] = {}
    for (const permission of Object.values(PERMISSIONS)) {
      result[role][permission] = perms.has(permission)
    }
  }

  return NextResponse.json(result)
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_SETTINGS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { role: string; permission: string; enabled: boolean }
    const { role, permission, enabled } = body

    if (role === "ADMIN") {
      return NextResponse.json(
        { message: "Administrator permissions cannot be modified" },
        { status: 400 }
      )
    }

    const validRoles: UserRole[] = ["BURSAR", "FINANCE", "MINISTER"]
    const validPermissions = Object.values(PERMISSIONS)

    if (!validRoles.includes(role as UserRole)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 })
    }
    if (!validPermissions.includes(permission as Permission)) {
      return NextResponse.json({ message: "Invalid permission" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()
    await updatePermission(supabase, role as UserRole, permission as Permission, enabled)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 })
  }
}
