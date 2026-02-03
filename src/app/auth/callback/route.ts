import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: async () => cookieStore.getAll(),
        setAll: async (cookieList) => {
          cookieList.forEach((c) => cookieStore.set(c.name, c.value, c.options));
        },
      },
    });

    await supabase.auth.exchangeCodeForSession(code);

    // ensure profile exists
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: user.user_metadata?.full_name ?? null,
      });
    }
  }

  return NextResponse.redirect(new URL("/app", requestUrl.origin));
}
