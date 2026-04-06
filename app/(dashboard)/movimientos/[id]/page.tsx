import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { canCreateOrEditMovements } from "@/lib/permissions/rbac";
import { AnularButton } from "@/components/movimientos/anular-button";
import { RegenerarPdfButton } from "@/components/movimientos/regenerar-pdf-button";
import { Card, CardActive, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { ChevronLeft, Edit, FileText, User, Calendar, Tag, Info as InfoIcon } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function MovimientoDetallePage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const canWrite = canCreateOrEditMovements(user?.role);

  const row = await prisma.movimiento.findUnique({
    where: { id },
    include: {
      creadoPor: { select: { nombre: true, email: true } },
      actualizadoPor: { select: { nombre: true, email: true } },
      anuladoPor: { select: { nombre: true, email: true } },
      auditorias: {
        include: { usuario: { select: { nombre: true } } },
        orderBy: { fechaEvento: "desc" },
      },
    },
  });

  if (!row) notFound();

  const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <Link 
            href="/movimientos" 
            className="group flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-container transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Volver a la lista
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-on-surface">Detalle #{row.folioDisplay}</h1>
            <span className={cn(
              "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
              row.estado === 'ACTIVO' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'
            )}>
              {row.estado}
            </span>
          </div>
          <p className="text-sm font-medium text-on-surface-variant">
            {row.tipoMovimiento} • Registrado el {formatDate(row.fechaMovimiento)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {canWrite && row.estado !== "ANULADO" && (
            <>
              <Button variant="outline" className="h-11 px-5 border-none bg-surface-container-low hover:bg-surface-container-high" render={<Link href={`/movimientos/${row.id}/editar`} />}>
                <Edit className="mr-2 h-4 w-4 text-primary" />
                Editar Datos
              </Button>
              <RegenerarPdfButton movimientoId={row.id} />
              <AnularButton
                movimientoId={row.id}
                className="h-11 px-5 border-none bg-destructive/10 hover:bg-destructive/20 text-destructive shadow-none font-bold"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <CardActive className="p-5 sm:p-10 border-none shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.05)]">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <DetailItem icon={<FileText />} label="Monto total" value={clp.format(Number(row.monto))} valueClass="text-3xl font-black text-primary" />
                <DetailItem icon={<Tag />} label="Categoría" value={row.categoria} />
                <DetailItem icon={<InfoIcon />} label="Concepto / Glosa" value={row.concepto} />
                <DetailItem icon={<User />} label="Referente / Donante" value={row.referente} />
              </div>
              <div className="space-y-6">
                <DetailItem icon={<Calendar />} label="Fecha del Movimiento" value={formatDate(row.fechaMovimiento)} />
                <DetailItem icon={<InfoIcon />} label="Medio de Pago" value={row.medioPago} />
                <DetailItem icon={<FileText />} label="Número de Respaldo" value={row.numeroRespaldo} />
                <DetailItem icon={<User />} label="Beneficiario" value={row.beneficiario} />
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-surface-container-highest/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 mb-2">Observaciones</p>
              <p className="text-sm font-medium text-on-surface leading-relaxed text-pretty">
                {row.observaciones || "Sin observaciones adicionales."}
              </p>
            </div>
            
            {row.estado === "ANULADO" && (
              <div className="mt-8 p-6 rounded-2xl bg-destructive/5 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-destructive">Motivo de Anulación</p>
                <p className="text-sm font-bold text-on-surface">{row.motivoAnulacion || "No especificado."}</p>
              </div>
            )}
          </CardActive>
        </div>

        <div className="space-y-8">
          <Card className="bg-surface-container-low border-none p-8 space-y-6 shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-4">Trazabilidad Central</h3>
            <div className="space-y-5">
              <AuditLogItem label="Creado por" user={row.creadoPor.nombre} date={row.creadoEn} />
              {row.actualizadoPor && (
                <AuditLogItem label="Última edición" user={row.actualizadoPor.nombre} date={row.actualizadoEn} />
              )}
              {row.anuladoPor && (
                <AuditLogItem label="Anulado por" user={row.anuladoPor.nombre} date={row.anuladoEn} />
              )}
            </div>
          </Card>

          <Card className="bg-surface-container-lowest border-none p-8 space-y-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Historial Técnico</h3>
            <div className="space-y-4">
              <TechnicalItem label="Estado PDF" value={row.pdfStatus} />
              <TechnicalItem label="ID Drive" value={row.driveFileId} />
              <TechnicalItem label="Sincronización" value={row.syncedToSheet ? "Completado" : "Pendiente"} />
              <TechnicalItem label="Notificación" value={row.notificationStatus} />
            </div>
          </Card>
        </div>
      </div>

      <CardActive className="p-0 overflow-hidden border-none shadow-[0px_20px_40px_-12px_rgba(25,28,30,0.03)]">
        <CardHeader className="bg-surface-container-low/50 px-10 py-6">
          <CardTitle className="text-xl font-bold tracking-tight text-on-surface">Historial de Auditoría</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y-0">
            {row.auditorias.map((item, index) => (
              <div 
                key={item.id} 
                className={cn(
                  "px-4 sm:px-10 py-4 sm:py-5 transition-all flex items-center justify-between",
                  index % 2 === 0 ? "bg-transparent" : "bg-surface-container-low/10"
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm font-bold text-on-surface">{item.accion}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                    Por <span className="text-primary">{item.usuario.nombre}</span> • {new Date(item.fechaEvento).toLocaleString("es-CL")}
                  </p>
                  {item.observacion && <p className="text-xs text-on-surface-variant mt-2 max-w-lg">{item.observacion}</p>}
                </div>
              </div>
            ))}
            {!row.auditorias.length && (
              <div className="p-10 text-center text-sm font-medium text-on-surface-variant">Sin eventos registrados.</div>
            )}
          </div>
        </CardContent>
      </CardActive>
    </section>
  );
}

function DetailItem({ icon, label, value, valueClass }: { icon: React.ReactNode, label: string, value?: string | null, valueClass?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">
        <div className="[&_svg]:size-3.5 text-primary">
          {icon}
        </div>
        {label}
      </div>
      <p className={cn("text-base font-bold text-on-surface", valueClass)}>
        {value || "—"}
      </p>
    </div>
  );
}

function AuditLogItem({ label, user, date }: { label: string, user: string, date: Date | string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">{label}</p>
      <p className="text-sm font-bold text-on-surface">{user}</p>
      <p className="text-[10px] font-medium text-on-surface-variant/60">
        {date ? new Date(date).toLocaleString("es-CL") : "—"}
      </p>
    </div>
  );
}

function TechnicalItem({ label, value }: { label: string, value?: string | null }) {
  return (
    <div className="flex items-center justify-between text-xs border-b border-surface-container-highest/10 pb-2 last:border-0 last:pb-0">
      <span className="font-bold text-on-surface-variant opacity-60">{label}</span>
      <span className="font-bold text-on-surface">{value || "—"}</span>
    </div>
  );
}

