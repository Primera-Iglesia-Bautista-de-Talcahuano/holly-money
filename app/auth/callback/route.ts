import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const origin = url.origin

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`)
  }

  const supabase = await createSupabaseServerClient()

  // Sign out any active session before accepting the invite/recovery code.
  // Without this, an admin clicking an invite link would silently switch
  // into the new user's account and end up on /activate.
  await supabase.auth.signOut()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/?error=invalid_link`)
  }

  return NextResponse.redirect(`${origin}/activate`)
}
