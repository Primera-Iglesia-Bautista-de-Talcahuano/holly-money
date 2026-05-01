"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Users, ChevronDown, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions
} from "@/components/ui/item"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { formatDate } from "@/lib/utils"
import { createMinistrySchema, assignMinisterSchema } from "@/lib/validators/ministry"
import type { CreateMinistryInput, AssignMinisterInput } from "@/lib/validators/ministry"
import { createMinistry, getMinistryAssignments, assignMinister } from "@/app/actions/ministries"

type Ministry = {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
}

export function MinistriesClient({ initialMinistries }: { initialMinistries: Ministry[] }) {
  const [ministries, setMinistries] = useState<Ministry[]>(initialMinistries)
  const [open, setOpen] = useState(false)

  const form = useForm<CreateMinistryInput>({
    resolver: zodResolver(createMinistrySchema),
    defaultValues: { name: "", description: "" }
  })

  async function handleCreate(values: CreateMinistryInput) {
    try {
      const createdData = await createMinistry({
        name: values.name.trim(),
        description: values.description?.trim() || undefined
      })
      setMinistries((prev) => [createdData as unknown as Ministry, ...prev])
      form.reset()
      setOpen(false)
      toast.success("Ministerio creado")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear ministerio")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ministerios</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los ministerios y sus ministros asignados
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) form.reset()
          }}
        >
          <DialogTrigger
            render={
              <Button size="sm">
                <Plus className="size-4" />
                Nuevo ministerio
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo ministerio</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4 pt-2">
              <Field>
                <FieldLabel htmlFor="name">Nombre *</FieldLabel>
                <Input id="name" placeholder="Ministerio de Jóvenes" {...form.register("name")} />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Input
                  id="description"
                  placeholder="Descripción opcional"
                  {...form.register("description")}
                />
                <FieldError errors={[form.formState.errors.description]} />
              </Field>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creando..." : "Crear ministerio"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {ministries.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <Users className="size-10 text-muted-foreground" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Sin ministerios</EmptyTitle>
            <EmptyDescription>Crea el primer ministerio para comenzar.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ItemGroup>
          {ministries.map((m) => (
            <MinistryItem key={m.id} ministry={m} />
          ))}
        </ItemGroup>
      )}
    </div>
  )
}

function MinistryItem({ ministry }: { ministry: Ministry }) {
  const [expanded, setExpanded] = useState(false)
  const [assignments, setAssignments] = useState<AssignmentRow[] | null>(null)
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  type AssignmentRow = {
    id: string
    user_id: string
    assigned_at: string
    unassigned_at: string | null
    users: { id: string; full_name: string; email: string } | null
  }

  const assignForm = useForm<AssignMinisterInput>({
    resolver: zodResolver(assignMinisterSchema),
    defaultValues: { user_id: "" }
  })

  async function loadAssignments() {
    setLoadingAssignments(true)
    try {
      const data = await getMinistryAssignments(ministry.id)
      setAssignments(data as unknown as AssignmentRow[])
    } catch {
      // silently fail
    } finally {
      setLoadingAssignments(false)
    }
  }

  async function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && assignments === null) loadAssignments()
  }

  async function handleAssign(values: AssignMinisterInput) {
    try {
      await assignMinister(ministry.id, { user_id: values.user_id.trim() })
      toast.success("Ministro asignado")
      assignForm.reset()
      loadAssignments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al asignar")
    }
  }

  return (
    <Item>
      <ItemContent>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ItemTitle>{ministry.name}</ItemTitle>
            {ministry.description && <ItemDescription>{ministry.description}</ItemDescription>}
          </div>
          {!ministry.is_active && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              Inactivo
            </span>
          )}
        </div>
      </ItemContent>
      <ItemActions>
        <Button variant="ghost" size="sm" onClick={handleToggle}>
          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          Asignaciones
        </Button>
      </ItemActions>
      {expanded && (
        <div className="col-span-full border-t px-4 py-3 space-y-3 bg-muted/30">
          <form onSubmit={assignForm.handleSubmit(handleAssign)} className="space-y-1">
            <div className="flex gap-2">
              <Input
                placeholder="ID del usuario"
                className="flex-1 text-sm"
                {...assignForm.register("user_id")}
              />
              <Button size="sm" type="submit" disabled={assignForm.formState.isSubmitting}>
                <UserPlus className="size-4" />
                Asignar
              </Button>
            </div>
            <FieldError errors={[assignForm.formState.errors.user_id]} />
          </form>
          {loadingAssignments && <p className="text-xs text-muted-foreground">Cargando...</p>}
          {assignments && assignments.length === 0 && (
            <p className="text-xs text-muted-foreground">Sin asignaciones históricas</p>
          )}
          {assignments && assignments.length > 0 && (
            <div className="space-y-1">
              {assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <span className="font-medium">{a.users?.full_name ?? a.user_id}</span>
                    <span className="text-muted-foreground ml-2">{a.users?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {a.unassigned_at ? (
                      <span>Hasta {formatDate(a.unassigned_at)}</span>
                    ) : (
                      <span className="text-green-600 font-medium">Activo</span>
                    )}
                    <span>Desde {formatDate(a.assigned_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Item>
  )
}
