import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/app");
  redirect("/login");
}
