import { Section, Text } from "react-email"

import { ActionButton, BaseEmail, DataTable, formatAmount } from "./components/base-email"

export function IntentionNotificationEmail({
  intention,
  isOverBudget,
  reviewUrl
}: {
  intention: { amount: number; description: string }
  isOverBudget: boolean
  reviewUrl: string
}) {
  return (
    <BaseEmail
      preview={`${isOverBudget ? "[SOBRE PRESUPUESTO] " : ""}Nueva solicitud de presupuesto`}
    >
      <Section style={{ padding: "24px 32px 8px" }}>
        <Text style={{ margin: 0, fontSize: 18, color: "#222", fontWeight: 700 }}>
          Nueva solicitud de intención de presupuesto
          {isOverBudget && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                marginLeft: 8
              }}
            >
              SOBRE PRESUPUESTO
            </span>
          )}
        </Text>
      </Section>
      <Section style={{ padding: "8px 32px" }}>
        <DataTable
          rows={[
            ["Monto solicitado", formatAmount(intention.amount)],
            ["Descripción", intention.description]
          ]}
        />
      </Section>
      <Section style={{ padding: "24px 32px" }}>
        <ActionButton label="Revisar solicitud" url={reviewUrl} />
        <Text style={{ margin: "12px 0 0", fontSize: 12, color: "#999" }}>
          Se requiere inicio de sesión para acceder.
        </Text>
      </Section>
    </BaseEmail>
  )
}
