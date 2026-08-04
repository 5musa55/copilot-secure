"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Page() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [items, setItems] = useState<any[]>([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Zjištění uživatele
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData?.user ? { email: authData.user.email || "" } : null);

      // 2. Načtení inzerátů
      const { data, error } = await supabase.from("items").select("*");
      
      // Uložení toho, co reálně přišlo, do žlutého boxu
      setDebugInfo({ error, itemCount: data?.length, data });

      if (!error && data) {
        setItems(data);
      }
    };

    fetchData();
  }, []);

  // OPRAVA: Bezpečné filtrování (nespadne, pokud title v databázi chybí)
  const filteredItems = items.filter((item) =>
    (item.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Bazar</h1>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">Přihlášen: {user.email}</span>
                <a href="/my-ads" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Moje inzeráty
                </a>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Odhlásit
                </button>
              </>
            ) : (
              <a href="/login" className="bg-blue-500 text-white px-4 py-2 rounded">
                Přihlásit se
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Vyhledat inzerát..."
          className="w-full p-3 border border-gray-300 rounded-lg text-black"
        />
      </div>

      <main className="container mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{item.price} Kč</p>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            Nebyly nalezeny žádné inzeráty.
          </p>
        )}
      </main>
    </div>
  );
}