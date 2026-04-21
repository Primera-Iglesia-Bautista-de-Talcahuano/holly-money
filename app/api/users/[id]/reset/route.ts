import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/supabase/server"
import { canManageUsers } from "@/lib/permissions/rbac"
import { usuariosService } from "@/services/usuarios/usuarios.service"

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const user = await getCurrentUser()
  if (!user || !canManageUsers(user.role)) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    await usuariosService.resetAccount(id, user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado"
    return NextResponse.json({ message }, { status: 400 })
  }
}
