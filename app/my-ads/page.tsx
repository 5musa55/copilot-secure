"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
}

export default function MyAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchAds = async () => {
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.id) {
      setError("Pro zobrazení inzerátů se musíte přihlásit.");
      return;
    }

    // ZDE JE ZÁSADNÍ ZMĚNA: Hledáme v tabulce "items" podle sloupce "user_id"
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Chyba při načítání inzerátů:", error.message);
      setError("Nepodařilo se načíst inzeráty. Zkontrolujte konzoli.");
    } else {
      setAds(data || []);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAds();
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Funkce pro smazání inzerátu
  const handleDelete = async (id: string) => {
      const confirmDelete = window.confirm("Opravdu chcete tento inzerát smazat?");
      if (!confirmDelete) return;
  
      // Check if the ad exists before attempting to delete
      const { data: existingAd, error: fetchError } = await supabase
        .from("ads")
        .select("id")
        .eq("id", id)
        .single();
  
      if (fetchError || !existingAd) {
        alert("Inzerát nebyl nalezen.");
        return;
      }
  
      const { error } = await supabase
        .from("ads")
        .delete()
        .eq("id", id);
    
      if (error) {
        // Vypíšeme do konzole kompletní detail chyby z Postgresu
        console.error("Detail chyby při mazání:", error);
        alert(`Inzerát nejde smazat: ${error.message}`);
      } else {
        // Po úspěšném smazání znova načteme seznam
        fetchAds();
      }
    };

  // Funkce pro úpravu (zatím jen přesměruje na stránku editace)
  const handleEdit = (id: string) => {
    router.push(`/edit-ad/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Moje inzeráty</h1>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Zpět na hlavní stránku
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {ads.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Nemáte žádné inzeráty. Klikněte na tlačítko níže pro přidání nového.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <li
                key={ad.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col"
              >
                <div className="grow">
                  <h2 className="text-lg font-bold">{ad.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{ad.description}</p>
                  <p className="text-xl font-semibold mt-3 text-blue-600 dark:text-blue-400">{ad.price} Kč</p>
                </div>
                
                {/* Tlačítka pro úpravu a mazání */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(ad.id)}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                  >
                    Smazat
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className="mt-8">
          <button
            onClick={() => router.push("/add-ad")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-bold"
          >
            + Přidat nový inzerát
          </button>
        </div>
      </div>
    </div>
  );
}