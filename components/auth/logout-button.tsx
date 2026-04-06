"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 px-3 h-10 border-none bg-transparent"
    >
      <LogOut className="h-4 w-4" />
      <span className="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
    </Button>
  );
}
