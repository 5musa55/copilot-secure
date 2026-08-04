"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset chybové zprávy

    // Validace vstupů
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Vyplňte prosím všechny údaje.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hesla se neshodují.");
      return;
    }
    if (password.length < 8) {
      setError("Heslo musí mít alespoň 8 znaků.");
      return;
    }

    try {
      // Registrace uživatele pomocí Supabase
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setError("Registrace se nezdařila. Zkuste to prosím znovu.");
      } else {
        router.push("/login"); // Přesměrování na přihlašovací stránku
      }
    } catch (err) {
      console.error("Chyba při registraci:", err);
      setError("Něco se pokazilo. Zkuste to prosím znovu.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          Registrace
        </h1>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              placeholder="Váš e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Heslo
            </label>
            <input
              id="password"
              type="password"
              placeholder="Vaše heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Potvrzení hesla
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Potvrďte heslo"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Zaregistrovat se
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Již máte účet?{" "}
          <a
            href="/login"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Přihlaste se
          </a>
        </p>
      </div>
    </div>
  );
}