import { createSupabaseAdminClient } from "@/lib/supabase/admin"

type SeriesItem = { name: string; income: number; expense: number }
type CategoryItem = { category: string; total: number }

type DashboardPeriod = {
  from?: string
  to?: string
}

type RpcResult = {
  totalIncome: number
  totalExpense: number
  movementCount: number
  series: Array<{ month: string; income: number; expense: number }>
  categoryBreakdown: Array<{ category: string; total: number }>
}

// Converts 'YYYY-MM' ISO month string to Spanish short locale label ("ene. 26").
function formatMonthES(isoMonth: string): string {
  const [year, month] = isoMonth.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString("es-CL", { month: "short", year: "2-digit" })
}

export const dashboardService = {
  async getSummary(period: DashboardPeriod = {}) {
    const admin = createSupabaseAdminClient()

    let pFrom: string | null = null
    let pTo: string | null = null

    if (period.from) {
      const d = new Date(period.from)
      if (!Number.isNaN(d.getTime())) pFrom = d.toISOString()
    }
    if (period.to) {
      const d = new Date(period.to)
      if (!Number.isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        pTo = d.toISOString()
      }
    }

    // Run aggregation RPC and recent-movements query in parallel
    const [rpcResponse, recentResponse] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      admin.rpc("get_dashboard_summary" as any, { p_from: pFrom, p_to: pTo }),
      admin
        .from("movements")
        .select(
          "id, folio, folio_display, movement_date, movement_type, amount, category, concept, status, created_by:users!created_by_id(full_name)"
        )
        .eq("status", "ACTIVE")
        .order("movement_date", { ascending: false })
        .order("folio", { ascending: false })
        .limit(8)
    ])

    if (rpcResponse.error) throw rpcResponse.error
    if (recentResponse.error) throw recentResponse.error

    const summary = rpcResponse.data as unknown as RpcResult

    const incomeExpenseSeries: SeriesItem[] = summary.series.map((s) => ({
      name: formatMonthES(s.month),
      income: Number(s.income),
      expense: Number(s.expense)
    }))

    return {
      kpis: {
        totalIncome: Number(summary.totalIncome),
        totalExpense: Number(summary.totalExpense),
        currentBalance: Number(summary.totalIncome) - Number(summary.totalExpense),
        movementCount: Number(summary.movementCount)
      },
      incomeExpenseSeries,
      categoryBreakdown: summary.categoryBreakdown.map(
        (c): CategoryItem => ({
          category: c.category,
          total: Number(c.total)
        })
      ),
      recentMovements: recentResponse.data
    }
  }
}
