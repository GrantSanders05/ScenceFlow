"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";

export default function LoginPage() {
  const supabase = supabaseBrowser();

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) alert(error.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow">
        <h1 className="text-2xl font-semibold">SceneFlow</h1>
        <p className="mt-2 text-zinc-300">
          A Fountain-like screenwriting app for web.
        </p>
        <button
          onClick={signIn}
          className="mt-6 w-full rounded-xl bg-zinc-100 px-4 py-2 text-zinc-900 font-medium hover:bg-white"
        >
          Continue with Google
        </button>
        <p className="mt-4 text-xs text-zinc-400">
          Write in plain text. Preview as a real screenplay. Export to PDF.
        </p>
      </div>
    </main>
  );
}
