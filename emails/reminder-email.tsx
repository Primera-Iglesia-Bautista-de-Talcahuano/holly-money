import { Section, Text } from "react-email"

import { ActionButton, BaseEmail } from "./components/base-email"

export function ReminderEmail({
  summary,
  dashboardUrl,
}: {
  summary: { intentions: number; settlements: number; missing_transfers: number }
  dashboardUrl: string
}) {
  const total = summary.intentions + summary.settlements + summary.missing_transfers

  return (
    <BaseEmail preview={`Recordatorio: ${total} item(s) pendiente(s)`}>
      <Section style={{ padding: "24px 32px 8px" }}>
        <Text style={{ margin: 0, fontSize: 18, color: "#222", fontWeight: 700 }}>
          Recordatorio: {total} item(s) pendiente(s)
        </Text>
      </Section>
      <Section style={{ padding: "8px 32px" }}>
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "8px 12px",
                  fontWeight: 600,
                  color: "#555",
                  borderBottom: "1px solid #eee",
                  width: "60%",
                }}
              >
                Intenciones pendientes de revisión
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  color: "#222",
                  borderBottom: "1px solid #eee",
                  textAlign: "right",
                }}
              >
                {summary.intentions}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  padding: "8px 12px",
                  fontWeight: 600,
                  color: "#555",
                  borderBottom: "1px solid #eee",
                }}
              >
                Rendiciones pendientes de revisión
              </td>
              <td
                style={{
                  padding: "8px 12px",
                  color: "#222",
                  borderBottom: "1px solid #eee",
                  textAlign: "right",
                }}
              >
                {summary.settlements}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px 12px", fontWeight: 600, color: "#555" }}>
                Transferencias pendientes de registrar
              </td>
              <td style={{ padding: "8px 12px", color: "#222", textAlign: "right" }}>
                {summary.missing_transfers}
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Section style={{ padding: "24px 32px" }}>
        <ActionButton label="Ir al sistema" url={dashboardUrl} />
      </Section>
    </BaseEmail>
  )
}
