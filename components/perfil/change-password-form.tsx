"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupInlineEnd } from "@/components/ui/input-group"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validators/auth"
import { toast } from "sonner"

export function ChangePasswordForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema)
  })

  const onSubmit = async (values: ChangePasswordValues) => {
    setError(null)
    const supabase = createSupabaseBrowserClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user?.email) {
      setError("No se pudo obtener la sesión actual.")
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: values.currentPassword
    })

    if (signInError) {
      setError("La contraseña actual es incorrecta.")
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.newPassword
    })

    if (updateError) {
      setError("No se pudo cambiar la contraseña. Intenta nuevamente.")
      return
    }

    reset()
    await supabase.auth.signOut()
    toast.success("Contraseña actualizada", {
      description: "Tu sesión fue cerrada por seguridad. Inicia sesión nuevamente."
    })
    router.push("/?reason=password_changed")
    router.refresh()
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <Alert variant="warning">
        <AlertTitle>Aviso importante</AlertTitle>
        <AlertDescription>
          Al cambiar tu contraseña, tu sesión actual será cerrada automáticamente y deberás iniciar
          sesión nuevamente con la nueva contraseña.
        </AlertDescription>
      </Alert>

      {/* Current password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="currentPassword"
          className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
        >
          Contraseña actual
        </Label>
        <InputGroup>
          <Input
            id="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder="••••••••"
            className="pr-10"
            aria-invalid={!!errors.currentPassword}
            {...register("currentPassword")}
          />
          <InputGroupInlineEnd>
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none rounded"
              aria-label={showCurrent ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </InputGroupInlineEnd>
        </InputGroup>
        {errors.currentPassword && (
          <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="newPassword"
          className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
        >
          Nueva contraseña
        </Label>
        <InputGroup>
          <Input
            id="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            className="pr-10"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          <InputGroupInlineEnd>
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none rounded"
              aria-label={showNew ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </InputGroupInlineEnd>
        </InputGroup>
        {errors.newPassword && (
          <p className="text-xs text-destructive">{errors.newPassword.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
        >
          Confirmar nueva contraseña
        </Label>
        <InputGroup>
          <Input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="pr-10"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <InputGroupInlineEnd>
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none rounded"
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </InputGroupInlineEnd>
        </InputGroup>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            Actualizando...
          </>
        ) : (
          "Cambiar contraseña"
        )}
      </Button>
    </form>
  )
}
