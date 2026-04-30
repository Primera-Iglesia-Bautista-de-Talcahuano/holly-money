import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { budgetService } from "@/services/budget/budget.service"
import { upsertMinistryBudgetSchema } from "@/lib/validators/budget"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_BUDGETS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const periodId = searchParams.get("period_id")
  if (!periodId) {
    return NextResponse.json({ message: "period_id required" }, { status: 400 })
  }
  const data = await budgetService.listBudgetsByPeriod(periodId)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_BUDGETS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = upsertMinistryBudgetSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = await budgetService.upsertMinistryBudget(parsed.data, user.id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
