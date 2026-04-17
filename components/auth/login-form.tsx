"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupInlineEnd } from "@/components/ui/input-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validators/auth"

const loginSchema = z.object({
  email: z.email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)

  const urlError = searchParams.get("error")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  })

  const forgotForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  })

  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: values.email.toLowerCase().trim(),
      password: values.password
    })

    if (authError) {
      setError("Credenciales inválidas o usuario inactivo.")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  const onForgotSubmit = async (values: ForgotPasswordValues) => {
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    })
    setForgotSent(true)
  }

  return (
    <>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
          >
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@iglesia.cl"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
            >
              Contraseña
            </Label>
            <button
              type="button"
              onClick={() => {
                setForgotOpen(true)
                setForgotSent(false)
              }}
              className="text-xs text-primary hover:underline focus-visible:outline-none"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
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

        {/* URL error (e.g. expired link) */}
        {urlError && (
          <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive text-center">
            {urlError === "link_expired"
              ? "El enlace ha expirado. Solicita uno nuevo."
              : "Ocurrió un error. Intenta nuevamente."}
          </p>
        )}

        {/* Auth error */}
        {error && (
          <p className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive text-center">
            {error}
          </p>
        )}

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting} className="w-full transition-colors">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              Verificando...
            </>
          ) : (
            "Ingresar"
          )}
        </Button>
      </form>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </DialogDescription>
          </DialogHeader>
          {forgotSent ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Si ese correo existe en el sistema, recibirás un enlace en los próximos minutos.
            </p>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
            >
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="forgot-email"
                  className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground"
                >
                  Correo electrónico
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="correo@iglesia.cl"
                  aria-invalid={!!forgotForm.formState.errors.email}
                  {...forgotForm.register("email")}
                />
                {forgotForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {forgotForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={forgotForm.formState.isSubmitting}>
                {forgotForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                    Enviando...
                  </>
                ) : (
                  "Enviar enlace"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
