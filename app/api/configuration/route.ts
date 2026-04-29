import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { auditService } from "@/services/audit/audit.service"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_USERS)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const auditLog = await auditService.listSystem(80)
  return NextResponse.json({ auditLog })
}
