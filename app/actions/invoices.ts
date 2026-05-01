"use server"

import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS, can } from "@/lib/permissions/rbac"
import { invoicesService } from "@/services/invoices/invoices.service"
import type { CreateInvoiceInput } from "@/lib/validators/invoice"

export async function createInvoice(input: CreateInvoiceInput) {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para crear boletas")
  }

  const created = await invoicesService.create(input, user.id)
  revalidatePath("/rendiciones")
  return created
}

export async function updateInvoiceStatus(id: string, status: "PENDING" | "SETTLED") {
  const user = await getCurrentUser()
  if (!user || !can(user.permissions, PERMISSIONS.CREATE_MOVEMENT)) {
    throw new Error("Sin permisos para actualizar boletas")
  }

  const updated = await invoicesService.updateStatus(id, status, user.id)
  revalidatePath("/rendiciones")
  return updated
}
