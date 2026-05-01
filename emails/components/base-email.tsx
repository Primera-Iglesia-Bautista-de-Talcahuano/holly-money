import { Body, Container, Head, Html, Preview, Section, Text } from "react-email"

const ORG_NAME = "Primera Iglesia Bautista de Talcahuano"
const ORG_SHORT = "Sistema Contable PIBT"

export { ORG_NAME, ORG_SHORT }

export function BaseEmail({ children, preview }: { children: React.ReactNode; preview?: string }) {
  return (
    <Html lang="es">
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body
        style={{ margin: 0, padding: 0, background: "#f5f5f5", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            background: "#fff",
            borderRadius: 8,
            maxWidth: 600,
            margin: "32px auto",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,.08)"
          }}
        >
          <Section style={{ background: "#1a3a5c", padding: "20px 32px" }}>
            <Text style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 700 }}>
              {ORG_SHORT}
            </Text>
            <Text style={{ margin: "4px 0 0", color: "#a8c4e0", fontSize: 13 }}>{ORG_NAME}</Text>
          </Section>
          {children}
          <Section
            style={{ background: "#f9f9f9", padding: "16px 32px", borderTop: "1px solid #eee" }}
          >
            <Text style={{ margin: 0, fontSize: 12, color: "#999" }}>{ORG_NAME}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export function DataTable({ rows }: { rows: [string, string][] }) {
  return (
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={{ border: "1px solid #eee", borderRadius: 6, overflow: "hidden" }}
    >
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td
              style={{
                padding: "8px 12px",
                fontWeight: 600,
                color: "#555",
                whiteSpace: "nowrap",
                borderBottom: "1px solid #eee",
                width: "40%"
              }}
            >
              {label}
            </td>
            <td style={{ padding: "8px 12px", color: "#222", borderBottom: "1px solid #eee" }}>
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ActionButton({
  label,
  url,
  color = "#1a3a5c"
}: {
  label: string
  url: string
  color?: string
}) {
  return (
    <a
      href={url}
      style={{
        display: "inline-block",
        background: color,
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 6,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600
      }}
    >
      {label}
    </a>
  )
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(amount)
}
