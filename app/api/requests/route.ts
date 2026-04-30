import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { createIntentionSchema } from "@/lib/validators/intention"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") ?? undefined

  if (user.role === "MINISTER") {
    const assignment = await ministriesService.getMinistryForUser(user.id)
    if (!assignment) return NextResponse.json([])
    const data = await intentionsService.list({ ministryId: assignment.ministry_id, status })
    return NextResponse.json(data)
  }

  if (!user.permissions.has(PERMISSIONS.REVIEW_INTENTIONS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const ministryId = searchParams.get("ministry_id") ?? undefined
  const data = await intentionsService.list({ ministryId, status })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.SUBMIT_INTENTIONS)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const assignment = await ministriesService.getMinistryForUser(user.id)
    if (!assignment) {
      return NextResponse.json({ message: "No ministry assigned to your account" }, { status: 400 })
    }

    const body: unknown = await request.json()
    const parsed = createIntentionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = await intentionsService.create(parsed.data, user.id, assignment.ministry_id)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
