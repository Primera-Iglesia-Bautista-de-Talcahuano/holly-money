import Link from "next/link";
import { cn } from "@/lib/utils";
import { dashboardService } from "@/services/dashboard/dashboard.service";
import { getCurrentUser } from "@/lib/auth/session";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";
import { IngresosEgresosChart, CategoriaChart } from "@/components/dashboard/dashboard-charts";
import { MovimientosTable } from "@/components/movimientos/movimientos-table";
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
  const from = (await searchParams)?.from;
  const to = (await searchParams)?.to;
  const [data, user] = await Promise.all([
    dashboardService.getResumen({ from, to }),
    getCurrentUser(),
  ]);
  const canWrite = canCreateOrEditMovements(user?.role);

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-6 sm:p-10 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Dashboard</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Resumen financiero de actividades.</p>
          </div>
          <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">
            Status: Activo
          </div>
        </div>

        <form className="mt-8 flex flex-wrap items-end gap-3 w-full" method="get">
          <div className="min-w-[160px] flex-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1" htmlFor="from">
              Periodo Inicial
            </Label>
            <DatePicker name="from" defaultValue={from} />
          </div>

          <div className="min-w-[160px] flex-1">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1" htmlFor="to">
              Periodo Final
            </Label>
            <DatePicker name="to" defaultValue={to} />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="submit" variant="primary" className="flex-1 sm:flex-none h-11 whitespace-nowrap px-6 shadow-lg shadow-primary/10 rounded-xl">
              Filtrar Datos
            </Button>
            <Link href="/dashboard" className="flex-1 sm:flex-none inline-flex h-11 px-6 items-center justify-center rounded-xl bg-surface-container-low border-none text-on-surface hover:bg-surface-container-high text-sm font-bold transition-all duration-200 whitespace-nowrap">
              Limpiar Filtros
            </Link>
          </div>
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

      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold tracking-tight text-on-surface">Últimos Movimientos</h2>
          <Link
            href="/movimientos"
            className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <MovimientosTable
          canWrite={canWrite}
          rows={data.ultimosMovimientos.map((row) => ({
            id: row.id,
            folioDisplay: row.folioDisplay,
            fechaMovimiento: row.fechaMovimiento.toISOString(),
            tipoMovimiento: row.tipoMovimiento,
            monto: row.monto.toString(),
            categoria: row.categoria,
            concepto: row.concepto,
            referente: row.referente,
            recibidoPor: row.recibidoPor,
            entregadoPor: row.entregadoPor,
            beneficiario: row.beneficiario,
            medioPago: row.medioPago,
            numeroRespaldo: row.numeroRespaldo,
            observaciones: row.observaciones,
            motivoAnulacion: row.motivoAnulacion,
            estado: row.estado,
            creadoPor: row.creadoPor,
          }))}
        />
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
    <CardActive className="flex flex-col gap-3 p-5 sm:p-8 transition-all hover:translate-y-[-4px] hover:shadow-[0px_30px_60px_-15px_rgba(25,28,30,0.12)] border-none min-w-0">
      <div className={cn("max-w-full overflow-hidden px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest truncate", colors)}>
        {label}
      </div>
      <p className="text-2xl sm:text-3xl font-black tracking-tight text-on-surface tabular-nums">{value}</p>
    </CardActive>
  );
}
