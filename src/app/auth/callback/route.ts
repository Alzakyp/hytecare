import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeReturnPath } from "@/lib/auth/helpers.js";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeReturnPath(searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=callback", process.env.APP_URL));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(error ? "/login?error=callback" : next, process.env.APP_URL));
}
