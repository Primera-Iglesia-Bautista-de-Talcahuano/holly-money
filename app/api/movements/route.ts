import { NextResponse } from "next/server"
import { createMovementSchema, movementFiltersSchema } from "@/lib/validators/movement"
import { movementsService } from "@/services/movements/movements.service"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { processMovementIntegrations } from "@/services/google/movement-postprocess"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.VIEW_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = movementFiltersSchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid filters", errors: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { data } = await movementsService.list({
    search: parsed.data.search,
    movement_type: parsed.data.movement_type,
    status: parsed.data.status
  })

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createMovementSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid data", errors: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const created = await movementsService.create(parsed.data, user.id)
    void processMovementIntegrations(created.id, user.id).catch(() => {
      // Mantener regla de negocio: si falla integración externa, movimiento queda guardado.
    })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error"
    return NextResponse.json({ message }, { status: 500 })
  }
}
