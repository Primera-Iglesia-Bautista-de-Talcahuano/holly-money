"use client"

import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { setTheme } from "@/app/actions/theme"

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
  return () => observer.disconnect()
}

const getSnapshot = () =>
  typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "dark"

const getServerSnapshot = () => false

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = () => {
    const next = !dark
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark")
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
    setTheme(next)
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Cambiar tema">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
