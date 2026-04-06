import Link from "next/link";
import { cn } from "@/lib/utils";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { IngresosEgresosChart, CategoriaChart } from "@/components/dashboard/dashboard-charts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardActive, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

type DashboardSearchParams = {
  from?: string;
  to?: string;
};

export default async function DashboardPage({ searchParams }: { searchParams?: DashboardSearchParams }) {
  const from = searchParams?.from;
  const to = searchParams?.to;
  const data = await dashboardService.getResumen({ from, to });

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-6 sm:p-10 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Dashboard</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Resumen financiero de actividades.</p>
          </div>
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
            Status: Activo
          </div>
        </div>

        <form className="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-[minmax(220px,_1fr)_minmax(220px,_1fr)_auto_auto] items-end" method="get">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1" htmlFor="from">
              Periodo Inicial
            </Label>
            <DatePicker name="from" defaultValue={from} />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1" htmlFor="to">
              Periodo Final
            </Label>
            <DatePicker name="to" defaultValue={to} />
          </div>

          <Button type="submit" variant="primary" className="h-14 whitespace-nowrap px-10 shadow-xl shadow-primary/10 rounded-2xl">
            Filtrar Datos
          </Button>
          <Link href="/dashboard" className="inline-flex h-14 px-8 items-center justify-center rounded-2xl bg-surface-container-low border-none text-on-surface hover:bg-surface-container-high text-sm font-bold transition-all duration-200">
            Limpiar Filtros
          </Link>
        </form>
      </Card>

      <div className="mt-4 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Ingresos" value={clp.format(data.kpis.totalIngresos)} variant="primary" />
        <KpiCard label="Total Egresos" value={clp.format(data.kpis.totalEgresos)} variant="tertiary" />
        <KpiCard label="Saldo Actual" value={clp.format(data.kpis.saldoActual)} variant="secondary" />
        <KpiCard label="Movimientos" value={String(data.kpis.cantidadMovimientos)} variant="neutral" />
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <CardActive className="p-0 min-w-0">
          <CardHeader>
            <CardTitle className="text-xl">Ingresos vs Egresos</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0">
            <IngresosEgresosChart data={data.serieIngresosEgresos} />
          </CardContent>
        </CardActive>
        <CardActive className="p-0 min-w-0">
          <CardHeader>
            <CardTitle className="text-xl">Resumen por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0">
            <CategoriaChart data={data.resumenPorCategoria} />
          </CardContent>
        </CardActive>
      </div>

      <div className="bg-surface-container-low/30 rounded-[2rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="text-on-surface-variant/40 border-none">
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Folio</th>
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Tipo</th>
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em] text-right">Monto</th>
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Categoria</th>
                <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Concepto</th>
              </tr>
            </thead>
            <tbody className="divide-y-0">
              {data.ultimosMovimientos.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={cn(
                    "group transition-all duration-300 hover:bg-surface-container-low/60",
                    index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/20"
                  )}
                >
                  <td className="px-8 py-5">
                    <Link className="font-bold text-primary hover:text-primary-container transition-colors" href={`/movimientos/${row.id}`}>
                      #{row.folioDisplay}
                    </Link>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium text-sm">
                    {new Date(row.fechaMovimiento).toLocaleDateString("es-CL", { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase",
                      row.tipoMovimiento === 'INGRESO' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                    )}>
                      {row.tipoMovimiento}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-on-surface tabular-nums">
                    {clp.format(Number(row.monto))}
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex rounded-full bg-secondary-container/50 px-3 py-1 text-[10px] font-bold text-on-secondary-container uppercase tracking-widest">
                      {row.categoria}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-on-surface font-medium truncate max-w-[200px] text-sm" title={row.concepto}>
                    {row.concepto}
                  </td>
                </tr>
              ))}
              {!data.ultimosMovimientos.length && (
                <tr>
                  <td className="px-8 py-20 text-center text-sm font-medium text-on-surface-variant/60" colSpan={6}>
                    Aún no hay movimientos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ label, value, variant }: { label: string; value: string; variant?: "primary" | "secondary" | "tertiary" | "neutral" }) {
  const colors = {
    primary: "text-primary bg-primary/5",
    secondary: "text-secondary bg-secondary/5",
    tertiary: "text-tertiary bg-tertiary/5",
    neutral: "text-on-surface-variant bg-surface-container-high/50",
  }[variant || "neutral"];

  return (
    <CardActive className="flex flex-col gap-3 p-6 sm:p-8 transition-all hover:translate-y-[-4px] hover:shadow-[0px_30px_60px_-15px_rgba(25,28,30,0.12)] border-none min-w-0 overflow-hidden">
      <div className={cn("w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", colors)}>
        {label}
      </div>
      <p className="text-3xl font-black tracking-tight text-on-surface tabular-nums">{value}</p>
    </CardActive>
  );
}
