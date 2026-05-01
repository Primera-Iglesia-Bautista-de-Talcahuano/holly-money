"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import type { CreateMinistryInput, AssignMinisterInput } from "@/lib/validators/ministry"

function assertMinistriesAccess(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    throw new Error("Sin permisos para gestionar ministerios")
  }
  return user
}

export async function createMinistry(input: CreateMinistryInput) {
  const user = assertMinistriesAccess(await getCurrentUser())
  const data = await ministriesService.create(input, user.id)
  revalidatePath("/ministries")
  return data
}

export async function getMinistryAssignments(ministryId: string) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_MINISTRIES)) {
    throw new Error("Sin permisos")
  }
  return ministriesService.getAssignments(ministryId)
}

export async function assignMinister(ministryId: string, input: AssignMinisterInput) {
  const user = assertMinistriesAccess(await getCurrentUser())
  const data = await ministriesService.assign(ministryId, input, user.id)
  revalidatePath("/ministries")
  return data
}
