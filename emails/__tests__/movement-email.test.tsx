import { renderToStaticMarkup } from "react-dom/server"

import { MovementEmail } from "../movement-email"
import type { MovementIntegrationPayload } from "@/services/google/types"

const render = (el: React.ReactElement) => renderToStaticMarkup(el)

const baseMovement: MovementIntegrationPayload = {
  movementId: "mov-1",
  folio: "000042",
  movementDate: "2026-05-01",
  movementTypeLabel: "INGRESO",
  amount: 150000,
  category: "Diezmos",
  concept: "Diezmo mayo",
  description: "Diezmo mayo 2026",
  registeredBy: "Marcelo Fuentes",
  registeredEmail: "marcelo@example.com",
  registeredAt: "2026-05-01T10:00:00Z",
  user: "Marcelo Fuentes",
  reference: null,
  receivedBy: null,
  deliveredBy: null,
  paymentMethod: null,
  supportNumber: null,
  notes: null
}

describe("MovementEmail", () => {
  it("renders without throwing", () => {
    expect(() => render(MovementEmail({ movement: baseMovement }))).not.toThrow()
  })

  it("includes folio and concept in output", () => {
    const html = render(MovementEmail({ movement: baseMovement }))
    expect(html).toContain("000042")
    expect(html).toContain("Diezmo mayo")
  })

  it("formats amount as CLP currency", () => {
    const html = render(MovementEmail({ movement: baseMovement }))
    expect(html).toContain("150.000")
  })

  it("includes preview text with folio", () => {
    const html = render(MovementEmail({ movement: baseMovement }))
    expect(html).toContain("Folio 000042")
  })

  it("omits optional fields when null", () => {
    const html = render(MovementEmail({ movement: baseMovement }))
    expect(html).not.toContain("Referente")
    expect(html).not.toContain("Observaciones")
  })

  it("shows optional fields when present", () => {
    const movement = { ...baseMovement, reference: "Ref-123", notes: "Nota especial" }
    const html = render(MovementEmail({ movement }))
    expect(html).toContain("Ref-123")
    expect(html).toContain("Nota especial")
  })
})
