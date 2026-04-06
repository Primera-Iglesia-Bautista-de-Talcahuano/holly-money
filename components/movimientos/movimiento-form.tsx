"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMovimientoSchema } from "@/lib/validators/movimiento";
import type { CreateMovimientoInput } from "@/lib/validators/movimiento";
import { CATEGORIAS_EGRESO, CATEGORIAS_INGRESO } from "@/types/movimientos";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

type Props = {
  mode: "create" | "edit";
  movimientoId?: string;
  initialValues?: Partial<CreateMovimientoInput>;
  onSuccess?: () => void;
};

function toDateValue(value?: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.slice(0, 10);
}

export function MovimientoForm({ mode, movimientoId, initialValues, onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MovimientoFormInput, unknown, CreateMovimientoInput>({
    resolver: zodResolver(createMovimientoSchema),
    defaultValues: {
      fechaMovimiento: toDateValue(initialValues?.fechaMovimiento),
      tipoMovimiento: initialValues?.tipoMovimiento ?? "INGRESO",
      monto: initialValues?.monto ?? 0,
      categoria: initialValues?.categoria ?? "",
      concepto: initialValues?.concepto ?? "",
      referente: initialValues?.referente ?? "",
      recibidoPor: initialValues?.recibidoPor ?? "",
      entregadoPor: initialValues?.entregadoPor ?? "",
      beneficiario: initialValues?.beneficiario ?? "",
      medioPago: initialValues?.medioPago ?? "",
      numeroRespaldo: initialValues?.numeroRespaldo ?? "",
      observaciones: initialValues?.observaciones ?? "",
    },
  });

  const tipo = useWatch({ control: form.control, name: "tipoMovimiento" });
  const categorias = useMemo(
    () => (tipo === "INGRESO" ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO),
    [tipo],
  );

  async function onSubmit(values: CreateMovimientoInput) {
    setError(null);
    const endpoint = mode === "create" ? "/api/movimientos" : `/api/movimientos/${movimientoId}`;
    const method = mode === "create" ? "POST" : "PUT";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      setError(payload.message ?? "No se pudo guardar el movimiento.");
      return;
    }

    const payload = (await res.json()) as { id?: string };
    if (onSuccess) {
      onSuccess();
    } else {
      if (mode === "create") {
        router.push(`/movimientos/${payload.id}`);
      } else {
        router.push(`/movimientos/${movimientoId}`);
      }
    }
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
      {/* SECCIÓN 1: DATOS PRINCIPALES */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-on-surface-variant/10" />
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
            Datos Principales
          </h3>
          <div className="h-px flex-1 bg-on-surface-variant/10" />
        </div>
        
        <div className="grid gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Fecha de Registro</Label>
            <Controller
              name="fechaMovimiento"
              control={form.control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? new Date(`${field.value}T12:00:00Z`) : undefined}
                  onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                />
              )}
            />
            {form.formState.errors.fechaMovimiento && (
              <p className="text-[10px] font-medium text-error mt-1 ml-1">{form.formState.errors.fechaMovimiento.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Tipo de Operación</Label>
            <select
              className="flex h-14 w-full items-center justify-between rounded-2xl border-none bg-surface-container-low px-5 py-2 text-base font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary-fixed appearance-none transition-all"
              {...form.register("tipoMovimiento")}
            >
              <option value="INGRESO">Ingreso (Entrada)</option>
              <option value="EGRESO">Egreso (Gasto)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Monto (CLP)</Label>
            <Input 
              type="number" 
              min="1" 
              className="h-14 text-lg font-bold"
              placeholder="0"
              {...form.register("monto", { valueAsNumber: true })} 
            />
            {form.formState.errors.monto && (
              <p className="text-[10px] font-medium text-error mt-1 ml-1">{form.formState.errors.monto.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Categoría</Label>
            <select
              className="flex h-14 w-full items-center justify-between rounded-2xl border-none bg-surface-container-low px-5 py-2 text-base font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary-fixed appearance-none transition-all"
              {...form.register("categoria")}
            >
              <option value="">Seleccione Categoría</option>
              {categorias.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {form.formState.errors.categoria && (
              <p className="text-[10px] font-medium text-error mt-1 ml-1">{form.formState.errors.categoria.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Concepto / Glosa</Label>
          <Input 
            className="h-14 font-medium"
            placeholder="Descripción breve del movimiento..."
            {...form.register("concepto")} 
          />
          {form.formState.errors.concepto && (
            <p className="text-[10px] font-medium text-error mt-1 ml-1">{form.formState.errors.concepto.message}</p>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: PARTICIPANTES */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-on-surface-variant/10" />
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
            Personas Involucradas
          </h3>
          <div className="h-px flex-1 bg-on-surface-variant/10" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Referente / Entidad</Label>
            <Input 
              className="h-14 bg-surface-container-low/50" 
              placeholder="Opcional"
              {...form.register("referente")} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Recibido por</Label>
            <Input 
              className="h-14 bg-surface-container-low/50" 
              placeholder="Opcional"
              {...form.register("recibidoPor")} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Entregado por</Label>
            <Input 
              className="h-14 bg-surface-container-low/50" 
              placeholder="Opcional"
              {...form.register("entregadoPor")} 
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: RESPALDO Y OBSERVACIONES */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-1">
          <div className="h-px flex-1 bg-on-surface-variant/10" />
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant opacity-50">
            Respaldo & Detalles
          </h3>
          <div className="h-px flex-1 bg-on-surface-variant/10" />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Beneficiario</Label>
            <Input 
              className="h-14 bg-surface-container-low/50" 
              placeholder="Opcional"
              {...form.register("beneficiario")} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Medio de Pago</Label>
            <Input 
              className="h-14 bg-surface-container-low/50" 
              placeholder="Efectivo, Transferencia, etc."
              {...form.register("medioPago")} 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">N° Documento Respaldo</Label>
            <Input 
              className="h-14 bg-surface-container-low/50" 
              placeholder="Boleta, Factura, etc."
              {...form.register("numeroRespaldo")} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 ml-1">Observaciones Adicionales</Label>
          <textarea
            className="flex min-h-[120px] w-full rounded-2xl border-none bg-surface-container-low/50 px-5 py-4 text-base font-medium text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-primary-fixed transition-all"
            placeholder="Algún detalle adicional relevante..."
            {...form.register("observaciones")}
          />
        </div>
      </div>

        {error && <p className="rounded-lg bg-error-container text-on-error-container px-4 py-3 text-sm font-semibold">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-on-surface-variant/5">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            variant="primary"
            className="h-14 px-10 text-lg shadow-xl shadow-primary/20 rounded-2xl flex-1 sm:flex-none"
          >
            {form.formState.isSubmitting
              ? "Procesando Registro..."
              : mode === "create"
                ? "Confirmar y Guardar Movimiento"
                : "Actualizar Información"}
          </Button>
          {(mode === "create" || onSuccess) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess?.()}
              className="h-14 border-none bg-surface-container-low hover:bg-surface-container-high transition-colors rounded-2xl flex-1 sm:flex-none"
            >
              Cerrar Formulario
            </Button>
          )}
        </div>
    </form>
  );
}

type MovimientoFormInput = z.input<typeof createMovimientoSchema>;
