"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddAd() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset chybové zprávy

    // Validace vstupů
    if (!title.trim() || !price.trim() || !description.trim()) {
      setError("Vyplňte prosím všechny údaje.");
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError("Cena musí být kladné číslo.");
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        setError("Pro přidání inzerátu se musíte přihlásit.");
        return;
      }

      // Přidání inzerátu do databáze
      const { error } = await supabase.from("ads").insert([
        {
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          user_id: user.user ? user.user.id : null,
        },
      ]);

      if (error) {
        setError("Nepodařilo se přidat inzerát. Zkuste to prosím znovu.");
      } else {
        router.push("/my-ads"); // Přesměrování zpět na stránku "Moje inzeráty"
      }
    } catch (err) {
      console.error("Chyba při přidávání inzerátu:", err);
      setError("Něco se pokazilo. Zkuste to prosím znovu.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          Přidat nový inzerát
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleAddAd} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Název
            </label>
            <input
              id="title"
              type="text"
              placeholder="Název inzerátu"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Cena
            </label>
            <input
              id="price"
              type="text"
              placeholder="Cena"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Popis
            </label>
            <textarea
              id="description"
              placeholder="Popis inzerátu"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Přidat inzerát
          </button>
        </form>
      </div>
    </div>
  );
}