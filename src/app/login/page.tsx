"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HeartPulse } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cream-50 via-lavender-50/30 to-rose-50/30">
        <Card className="w-full max-w-md text-center p-8">
          <h1 className="font-display text-xl font-bold text-gray-800 mb-2">
            Supabase not configured
          </h1>
          <p className="text-gray-500 text-sm">
            Copy <code className="bg-lavender-50 px-1 rounded">.env.local.example</code> to{" "}
            <code className="bg-lavender-50 px-1 rounded">.env.local</code> and add your
            Supabase URL and anon key. See SUPABASE_SETUP.md for details.
          </p>
        </Card>
      </div>
    );
  }

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (signUpError) throw signUpError;
        setMessage(
          "Account created! Check your email to confirm, then sign in."
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        window.location.href = "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-cream-50 via-lavender-50/30 to-rose-50/30">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-lavender-300 to-rose-300 flex items-center justify-center mb-4">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            GLP-1 Journey
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {mode === "signin"
              ? "Sign in to access your wellness data"
              : "Create an account to save your journey securely"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <Input
              label="Your name"
              type="text"
              placeholder="How should we greet you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-rose-500 bg-rose-50 p-3 rounded-xl">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-turquoise-700 bg-turquoise-50 p-3 rounded-xl">
              {message}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setMessage(null);
            }}
            className="text-lavender-600 font-medium hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </Card>
    </div>
  );
}
