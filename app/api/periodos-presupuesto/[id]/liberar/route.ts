import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_BUDGETS)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await budgetService.releasePeriod(id, user.id)
    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 500 })
  }
}
