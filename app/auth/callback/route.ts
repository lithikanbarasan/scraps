import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code && !url.searchParams.has("error")) {
    try {
      const supabase = createClient(await cookies());
      const { error } =
        await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(
          new URL("/reset-password", url.origin)
        );
      }
    } catch {
      // Send invalid or unsuccessful recovery attempts to the error state.
    }
  }

  return NextResponse.redirect(
    new URL("/reset-password?error=invalid", url.origin)
  );
}