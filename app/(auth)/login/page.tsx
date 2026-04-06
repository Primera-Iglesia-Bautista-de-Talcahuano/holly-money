import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentSession } from "@/lib/auth/session";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked } from "lucide-react";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center p-6 bg-surface">
      <Card className="w-full max-w-md bg-surface-container-low shadow-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 text-primary">
            <BookMarked className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-on-surface">Sistema Contable Iglesia</CardTitle>
          <CardDescription className="text-on-surface-variant font-medium text-base mt-2">Gestión Ministerial de Finanzas</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center pt-8">
          <p className="text-center text-xs tracking-wider text-on-surface-variant max-w-[250px]">
            Usuario inicial: admin@iglesia.local / contrasena definida por seed.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
