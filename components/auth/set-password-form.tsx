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
import { setPasswordSchema, type SetPasswordValues } from "@/lib/validators/auth"

export function SetPasswordForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema)
  })

  const onSubmit = async (values: SetPasswordValues) => {
    setError(null)
    const supabase = createSupabaseBrowserClient()

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password
    })

    if (updateError) {
      setError("No se pudo actualizar la contraseña. El enlace puede haber expirado.")
      return
    }

    // Mark user as ACTIVE in the DB
    await fetch("/api/auth/activate", { method: "POST" })

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="password"
          className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
        >
          Nueva contraseña
        </Label>
        <InputGroup>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="pr-10"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <InputGroupInlineEnd>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none rounded"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </InputGroupInlineEnd>
        </InputGroup>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
        >
          Confirmar contraseña
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
        <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive text-center">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            Guardando...
          </>
        ) : (
          "Establecer contraseña"
        )}
      </Button>
    </form>
  )
}
