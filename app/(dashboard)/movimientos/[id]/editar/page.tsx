type Props = { params: Promise<{ id: string }> };
import { notFound, redirect } from "next/navigation";
import { MovimientoForm } from "@/components/movimientos/movimiento-form";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";

export default async function EditarMovimientoPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!canCreateOrEditMovements(user?.role)) {
    redirect(`/movimientos/${id}`);
  }

  const row = await prisma.movimiento.findUnique({ where: { id } });
  if (!row) notFound();
  if (row.estado === "ANULADO") redirect(`/movimientos/${id}`);

  return (
    <section className="mx-auto max-w-5xl space-y-8">
      <Card className="bg-surface-container-lowest p-8 shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.08)] border-none">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Editar Movimiento</h1>
        <p className="mt-1 text-sm text-on-surface-variant font-medium">Solo se permite editar movimientos en estado activo.</p>
      </Card>

      <Card className="bg-surface-container-lowest p-10 shadow-[0px_40px_80px_-20px_rgba(25,28,30,0.15)] border-none rounded-[2rem]">
        <MovimientoForm
          mode="edit"
          movimientoId={id}
          initialValues={{
            fechaMovimiento: row.fechaMovimiento.toISOString(),
            tipoMovimiento: row.tipoMovimiento,
            monto: Number(row.monto),
            categoria: row.categoria,
            concepto: row.concepto,
            referente: row.referente ?? "",
            recibidoPor: row.recibidoPor ?? "",
            entregadoPor: row.entregadoPor ?? "",
            beneficiario: row.beneficiario ?? "",
            medioPago: row.medioPago ?? "",
            numeroRespaldo: row.numeroRespaldo ?? "",
            observaciones: row.observaciones ?? "",
          }}
        />
      </Card>
    </section>
  );
}
