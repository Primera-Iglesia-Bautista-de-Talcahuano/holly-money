import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase/server"
import { PERMISSIONS } from "@/lib/permissions/rbac"
import { intentionsService } from "@/services/intentions/intentions.service"
import { ministriesService } from "@/services/ministries/ministries.service"
import { budgetService } from "@/services/budget/budget.service"
import { IntentionsClient } from "@/components/intentions/intentions-client"

export default async function RequestsPage() {
  const user = await getCurrentUser()
  if (!user || !user.permissions.has(PERMISSIONS.VIEW_WORKFLOW)) redirect("/dashboard")

  if (user.role === "MINISTER") {
    const assignment = await ministriesService.getMinistryForUser(user.id)
    const activePeriod = await budgetService.getActivePeriod()

    const budgetSummary =
      assignment && activePeriod
        ? await budgetService.getBudgetSummary(assignment.ministry_id, activePeriod.id)
        : null

    const intentions = assignment
      ? await intentionsService.list({ ministryId: assignment.ministry_id })
      : []

    return (
      <IntentionsClient
        role="MINISTER"
        intentions={intentions}
        ministry={assignment?.ministries ?? null}
        budgetSummary={budgetSummary}
        activePeriod={activePeriod}
      />
    )
  }

  const intentions = await intentionsService.list()

  return (
    <IntentionsClient
      role={user.role}
      intentions={intentions}
      ministry={null}
      budgetSummary={null}
      activePeriod={null}
    />
  )
}
