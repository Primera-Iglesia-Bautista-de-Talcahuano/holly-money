"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function LoginPageEffects() {
  const params = useSearchParams()

  useEffect(() => {
    const reason = params.get("reason")
    if (reason === "password_changed") {
      toast.success("Contraseña actualizada", {
        description: "Inicia sesión con tu nueva contraseña."
      })
    }
  }, [params])

  return null
}
