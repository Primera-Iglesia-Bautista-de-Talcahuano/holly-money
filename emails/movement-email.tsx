import { Section, Text } from "react-email"

import { BaseEmail, DataTable, formatAmount } from "./components/base-email"
import type { MovementIntegrationPayload } from "@/services/google/types"

export function MovementEmail({ movement }: { movement: MovementIntegrationPayload }) {
  const rows: [string, string][] = (
    [
      ["Folio", movement.folio],
      ["Fecha", movement.movementDate],
      ["Tipo", movement.movementTypeLabel],
      ["Monto", formatAmount(movement.amount)],
      ["Categoría", movement.category],
      ["Concepto", movement.concept],
      movement.reference ? ["Referente", movement.reference] : null,
      movement.receivedBy ? ["Recibido por", movement.receivedBy] : null,
      movement.deliveredBy ? ["Entregado por", movement.deliveredBy] : null,
      movement.paymentMethod ? ["Medio de pago", movement.paymentMethod] : null,
      movement.supportNumber ? ["N° respaldo", movement.supportNumber] : null,
      movement.notes ? ["Observaciones", movement.notes] : null,
      ["Registrado por", movement.registeredBy],
    ] as ([string, string] | null)[]
  ).filter((r): r is [string, string] => r !== null)

  return (
    <BaseEmail preview={`Nuevo movimiento: ${movement.movementTypeLabel} - Folio ${movement.folio}`}>
      <Section style={{ padding: "24px 32px 8px" }}>
        <Text style={{ margin: 0, fontSize: 15, color: "#333" }}>
          Se ha registrado un nuevo movimiento:
        </Text>
      </Section>
      <Section style={{ padding: "8px 32px 24px" }}>
        <DataTable rows={rows} />
      </Section>
    </BaseEmail>
  )
}
