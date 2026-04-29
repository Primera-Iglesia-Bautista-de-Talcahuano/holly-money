import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { dashboardService } from "@/services/dashboard/dashboard.service"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.VIEW_MOVEMENT)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const data = await dashboardService.getSummary()
  return NextResponse.json(data)
}
