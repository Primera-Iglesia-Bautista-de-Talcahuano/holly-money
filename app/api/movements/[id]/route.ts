import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { movementsService } from "@/services/movements/movements.service"
import { updateMovementSchema } from "@/lib/validators/movement"
import { processMovementIntegrations } from "@/services/google/movement-postprocess"

type Params = { params: Promise<{ id: string }> }

export async function GET(_: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.VIEW_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const row = await movementsService.findById(id)
  if (!row) {
    return NextResponse.json({ message: "Movement not found" }, { status: 404 })
  }

  return NextResponse.json(row)
}

export async function PUT(request: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = updateMovementSchema.safeParse({ ...(body as Record<string, unknown>), id })
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updated = await movementsService.update(id, parsed.data, user.id)
    void processMovementIntegrations(updated.id, user.id).catch(() => {
      // Mantener regla de negocio: si falla integración externa, movimiento queda guardado.
    })
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    const status = message.includes("not found") ? 404 : 400
    return NextResponse.json({ message }, { status })
  }
}
