import { renderToStaticMarkup } from "react-dom/server"

import { AuthEmail } from "../auth-email"

const render = (el: React.ReactElement) => renderToStaticMarkup(el)

const baseProps = {
  title: "Activa tu cuenta",
  intro: "Un administrador ha creado tu cuenta.",
  buttonLabel: "Activar cuenta",
  buttonUrl: "https://example.com/activate?token=abc",
  expiry: "24 horas",
}

describe("AuthEmail", () => {
  it("renders without throwing", () => {
    expect(() => render(AuthEmail(baseProps))).not.toThrow()
  })

  it("includes title and intro", () => {
    const html = render(AuthEmail(baseProps))
    expect(html).toContain("Activa tu cuenta")
    expect(html).toContain("Un administrador ha creado tu cuenta.")
  })

  it("renders button with correct label and url", () => {
    const html = render(AuthEmail(baseProps))
    expect(html).toContain("Activar cuenta")
    expect(html).toContain("https://example.com/activate?token=abc")
  })

  it("includes expiry notice", () => {
    const html = render(AuthEmail(baseProps))
    expect(html).toContain("24 horas")
  })
})
