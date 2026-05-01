"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { movementsService } from "@/services/movements/movements.service"
import { processMovementIntegrations } from "@/services/google/movement-postprocess"
import type {
  CreateMovementInput,
  UpdateMovementInput,
  CancelMovementInput
} from "@/lib/validators/movement"

export async function createMovement(input: CreateMovementInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para crear movimientos")
  }

  const created = await movementsService.create(input, user.id)
  void processMovementIntegrations(created.id, user.id).catch(() => {})
  revalidatePath("/movements")
  return created
}

export async function updateMovement(id: string, input: Omit<UpdateMovementInput, "id">) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para editar movimientos")
  }

  const updated = await movementsService.update(id, { ...input, id }, user.id)
  void processMovementIntegrations(updated.id, user.id).catch(() => {})
  revalidatePath(`/movements/${id}`)
  revalidatePath("/movements")
  return updated
}

export async function cancelMovement(id: string, input: CancelMovementInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para anular movimientos")
  }

  const result = await movementsService.cancel(id, input, user.id)
  void processMovementIntegrations(result.id, user.id).catch(() => {})
  revalidatePath(`/movements/${id}`)
  revalidatePath("/movements")
  return result
}

export async function regeneratePdf(id: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos")
  }

  await processMovementIntegrations(id, user.id)
  revalidatePath(`/movements/${id}`)
}
