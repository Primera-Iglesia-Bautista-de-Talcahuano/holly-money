import { Section, Text } from "react-email"

import { ActionButton, BaseEmail, ORG_SHORT } from "./components/base-email"

export type AuthEmailProps = {
  title: string
  intro: string
  buttonLabel: string
  buttonUrl: string
  expiry: string
}

export function AuthEmail({ title, intro, buttonLabel, buttonUrl, expiry }: AuthEmailProps) {
  return (
    <BaseEmail preview={`${title} — ${ORG_SHORT}`}>
      <Section style={{ padding: "32px" }}>
        <Text style={{ margin: "0 0 16px", fontSize: 20, color: "#222", fontWeight: 700 }}>
          {title}
        </Text>
        <Text style={{ margin: "0 0 24px", color: "#555", fontSize: 14, lineHeight: "1.6" }}>
          {intro}
        </Text>
        <ActionButton label={buttonLabel} url={buttonUrl} />
        <Text style={{ margin: "24px 0 0", color: "#999", fontSize: 12 }}>
          Este enlace expira en {expiry}. Si no solicitaste esto, puedes ignorar este correo.
        </Text>
      </Section>
    </BaseEmail>
  )
}
