import { supabaseServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return <>{children}</>;
}
