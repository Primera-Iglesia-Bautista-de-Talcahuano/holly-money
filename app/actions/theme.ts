"use server"

import { cookies } from "next/headers"

export async function setTheme(dark: boolean) {
  const cookieStore = await cookies()
  if (dark) {
    cookieStore.set("pibt-theme", "dark", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    })
  } else {
    cookieStore.delete("pibt-theme")
  }
}
