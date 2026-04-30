import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { ministriesService } from "@/services/ministries/ministries.service"
import { MinistriesClient } from "@/components/ministries/ministries-client"

export default async function MinistriesPage() {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.MANAGE_MINISTRIES)) redirect("/dashboard")

  const ministries = await ministriesService.list()
  return <MinistriesClient initialMinistries={ministries} />
}
