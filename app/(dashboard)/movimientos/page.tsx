import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";
import { NewMovimientoDialog } from "@/components/movimientos/new-movimiento-dialog";
import { MovimientosTable } from "@/components/movimientos/movimientos-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ search?: string; tipo?: "INGRESO" | "EGRESO" | "ALL"; estado?: "ACTIVO" | "ANULADO" | "ALL" }>;
};


export default async function MovimientosPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const canWrite = canCreateOrEditMovements(user?.role);
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const tipo = params.tipo ?? "ALL";
  const estado = params.estado ?? "ALL";

  const rows = await prisma.movimiento.findMany({
    where: {
      ...(tipo !== "ALL" ? { tipoMovimiento: tipo } : {}),
      ...(estado !== "ALL" ? { estado } : {}),
      ...(search
        ? {
            OR: [
              { folioDisplay: { contains: search } },
              { categoria: { contains: search } },
              { concepto: { contains: search } },
              { referente: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      creadoPor: { select: { nombre: true } },
    },
    orderBy: [{ fechaMovimiento: "desc" }, { folio: "desc" }],
  });

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <Card className="bg-surface-container-lowest p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Movimientos</h1>
            <p className="mt-1 text-sm text-on-surface-variant font-medium">Registro de ingresos y egresos con trazabilidad.</p>
          </div>
          {canWrite && <NewMovimientoDialog />}
        </div>

        <form className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-4 items-end" method="get">
          <Input name="search" defaultValue={search} placeholder="Buscar por folio, concepto..." />
          <select name="tipo" defaultValue={tipo} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="ALL">Todos los tipos</option>
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
          </select>
          <select name="estado" defaultValue={estado} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="ANULADO">Anulado</option>
          </select>
          <Button type="submit" variant="outline">
            Aplicar filtros
          </Button>
        </form>
      </Card>

        <MovimientosTable
          canWrite={canWrite}
          rows={rows.map((row) => ({
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
    </section>
  );
}
