import { Section, Text } from "react-email"

import { ActionButton, BaseEmail, DataTable, formatAmount } from "./components/base-email"

export function SettlementReviewEmail({
  settlement,
  minister,
  action,
  detailUrl,
}: {
  settlement: { amount: number; description: string }
  minister: { full_name: string }
  action: "APPROVED" | "REJECTED"
  detailUrl: string
}) {
  const isApproved = action === "APPROVED"
  const statusLabel = isApproved ? "aprobada" : "rechazada"
  const statusColor = isApproved ? "#16a34a" : "#dc2626"

  return (
    <BaseEmail preview={`Tu rendición fue ${statusLabel}`}>
      <Section style={{ padding: "24px 32px 8px" }}>
        <Text style={{ margin: 0, fontSize: 18, color: "#222", fontWeight: 700 }}>
          Tu rendición fue{" "}
          <span style={{ color: statusColor }}>{statusLabel}</span>
        </Text>
        <Text style={{ margin: "8px 0 0", color: "#555", fontSize: 14 }}>
          Hola {minister.full_name}, tu rendición de gastos ha sido revisada por el equipo de
          tesorería.
        </Text>
      </Section>
      <Section style={{ padding: "8px 32px" }}>
        <DataTable
          rows={[
            ["Monto", formatAmount(settlement.amount)],
            ["Descripción", settlement.description],
          ]}
        />
      </Section>
      <Section style={{ padding: "24px 32px" }}>
        <ActionButton label="Ver detalle" url={detailUrl} />
        <Text style={{ margin: "12px 0 0", fontSize: 12, color: "#999" }}>
          Se requiere inicio de sesión para acceder.
        </Text>
      </Section>
    </BaseEmail>
  )
}
