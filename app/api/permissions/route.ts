import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { getPermissionMap, updatePermission } from "@/services/permissions/permissions.service"
import { updatePermissionSchema } from "@/lib/validators/settings"
import type { UserRole } from "@/types/auth"
import type { Permission } from "@/lib/permissions/rbac"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_SETTINGS)) {
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
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_SETTINGS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = updatePermissionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { role, permission, enabled } = parsed.data
    const supabase = await createSupabaseServerClient()
    await updatePermission(supabase, role as UserRole, permission as Permission, enabled)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Unexpected error" }, { status: 500 })
  }
}
