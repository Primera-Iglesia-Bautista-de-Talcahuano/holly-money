"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { settingsService } from "@/services/settings/settings.service"
import type { UpdateSettingsInput } from "@/lib/validators/settings"

export async function updateSettings(input: UpdateSettingsInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.MANAGE_SETTINGS)) {
    throw new Error("Sin permisos para actualizar configuración")
  }

  const data = await settingsService.update(input, user.id)
  revalidatePath("/configuration")
  return data
}
