"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function RegenerarPdfButton({ movimientoId }: { movimientoId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onClick() {
    setLoading(true)
    const res = await fetch(`/api/movements/${movimientoId}/regenerate-pdf`, {
      method: "POST"
    })
    setLoading(false)

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string }
      toast.error(payload.message ?? "No se pudo regenerar el PDF.")
      return
    }

    router.refresh()
  }

  return (
    <Button type="button" variant="outline" disabled={loading} onClick={onClick} className="h-11">
      {loading ? "Procesando..." : "Regenerar PDF"}
    </Button>
  )
}
