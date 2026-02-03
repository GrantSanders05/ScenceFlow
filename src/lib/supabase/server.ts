import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookies: {
      getAll: async () => cookieStore.getAll(),
      setAll: async (cookieList) => {
        cookieList.forEach((c) =>
          cookieStore.set(c.name, c.value, c.options)
        );
      },
    },
  });
}
