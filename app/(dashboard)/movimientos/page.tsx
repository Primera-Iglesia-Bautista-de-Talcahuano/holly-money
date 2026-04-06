import Link from "next/link";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";
import { AnularButton } from "@/components/movimientos/anular-button";
import { NewMovimientoDialog } from "@/components/movimientos/new-movimiento-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  searchParams: Promise<{ search?: string; tipo?: "INGRESO" | "EGRESO" | "ALL"; estado?: "ACTIVO" | "ANULADO" | "ALL" }>;
};

const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

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
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Movimientos</h1>
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

        <div className="bg-surface-container-low/30 rounded-[2rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="text-on-surface-variant/40 border-none">
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Folio</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Fecha</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Tipo</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em] text-right">Monto</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Categoria</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Concepto</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Estado</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em]">Responsable</th>
                  <th className="px-8 py-6 font-bold text-[10px] uppercase tracking-[0.2em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y-0">
                {rows.map((row, index) => (
                  <tr 
                    key={row.id} 
                    className={cn(
                      "group transition-all duration-300 hover:bg-surface-container-low/60",
                      index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/20"
                    )}
                  >
                    <td className="px-8 py-5 font-bold text-on-surface">#{row.folioDisplay}</td>
                    <td className="px-8 py-5 text-on-surface-variant font-medium text-sm">
                      {new Date(row.fechaMovimiento).toLocaleDateString("es-CL", { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                    <td className="px-8 py-5 text-on-surface font-medium max-w-[200px] truncate" title={row.concepto}>
                      {row.concepto}
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase",
                        row.estado === 'ACTIVO' ? 'bg-primary/5 text-primary/70' : 'bg-destructive/5 text-destructive/70'
                      )}>
                        {row.estado}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant font-medium text-xs">
                      {row.creadoPor.nombre.split(' ')[0]}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="xs" className="hover:bg-primary/5 text-primary font-bold rounded-full px-4" render={<Link href={`/movimientos/${row.id}`} />}>
                          Ver
                        </Button>
                        {canWrite && row.estado !== "ANULADO" && (
                          <AnularButton movimientoId={row.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="px-8 py-20 text-center text-sm font-medium text-on-surface-variant/60" colSpan={9}>
                      No hay registros en la bitácora para los filtros seleccionados.
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
