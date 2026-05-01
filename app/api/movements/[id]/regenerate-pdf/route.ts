import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { processMovementIntegrations } from "@/services/google/movement-postprocess"

type Params = { params: Promise<{ id: string }> }

export async function POST(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  try {
    await processMovementIntegrations(id, user.id)
    return NextResponse.json({ ok: true, message: "Regeneration started/completed" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error regenerando PDF"
    return NextResponse.json({ ok: false, message }, { status: 400 })
  }
}
