"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupInlineEnd } from "@/components/ui/input-group"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

    await fetch("/api/auth/activate", { method: "POST" })

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!errors.password || undefined}>
          <FieldLabel
            htmlFor="password"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Nueva contraseña
          </FieldLabel>
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
          <FieldError errors={[errors.password]} />
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Confirmar contraseña
          </FieldLabel>
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
          <FieldError errors={[errors.confirmPassword]} />
        </Field>
      </FieldGroup>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
