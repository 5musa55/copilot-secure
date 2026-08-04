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
  images?: string[]; 
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

    const { data, error } = await supabase
      .from("items")
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

  const handleDelete = async (id: string) => {
    const confirmation = window.confirm("Opravdu chcete smazat tento inzerát?");
    if (!confirmation) return;

    const { error } = await supabase.from("items").delete().eq("id", id.toString());
    
    if (error) {
        console.error("Chyba od Supabase:", error);
        alert("Chyba při mazání inzerátu.");
    } else {
        setAds((prev: Ad[]) => prev.filter((item: Ad) => item.id !== id.toString()));
        alert("Inzerát byl úspěšně smazán.");
    }
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
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden"
              >
                {ad.images && ad.images.length > 0 ? (
                  <div className="w-full h-48 relative bg-gray-200 dark:bg-gray-700">
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    {ad.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        +{ad.images.length - 1} fotek
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">Bez obrázku</span>
                  </div>
                )}

                <div className="p-4 flex flex-col grow">
                  <div className="grow">
                    <h2 className="text-lg font-bold">{ad.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">{ad.description}</p>
                    <p className="text-xl font-semibold mt-3 text-blue-600 dark:text-blue-400">{ad.price} Kč</p>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => router.push(`/edit-ad/${ad.id}`)}
                      className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id.toString())}
                      className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
                    >
                      Smazat
                    </button>
                  </div>
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
