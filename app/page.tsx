"use client";

import { useState, useEffect } from "react";
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
  contact_email?: string; 
  user_id?: string; 
}

export default function Page() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null);
  const [items, setItems] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      setUser(authData?.user ? { 
        email: authData.user.email || "", 
        id: authData.user.id 
      } : null);

      const { data, error } = await supabase.from("items").select("*");
      setDebugInfo({ error, itemCount: data?.length, data });

      if (!error && data) {
        setItems(data);
      }
    };

    fetchData();
  }, []);

  const filteredItems = items.filter((item) =>
    (item.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (id: string) => {
    setRevealedContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
          <div 
            key={item.id} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden"
          >
            {item.images && item.images.length > 0 ? (
              <div className="w-full h-48 relative bg-gray-200 dark:bg-gray-700">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.images.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    +{item.images.length - 1} fotek
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Bez obrázku</span>
              </div>
            )}

            <div className="p-4 flex flex-col grow justify-between">
              <div>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{item.description}</p>
              </div>
              
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{item.price} Kč</p>
                  
                  {!user ? (
                    <span className="text-xs text-gray-500 italic">Pro kontakt se přihlaste</span>
                  ) : user.id === item.user_id ? (
                    <span className="text-xs text-green-700 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      Váš inzerát
                    </span>
                  ) : (
                    <button
                      onClick={() => toggleContact(item.id)}
                      className="text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded transition"
                    >
                      {revealedContacts.has(item.id) ? "Skrýt kontakt" : "Zobrazit kontakt"}
                    </button>
                  )}
                </div>

                {revealedContacts.has(item.id) && user?.id !== item.user_id && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-sm flex justify-between items-center">
                    <span className="font-medium">
                      E-mail: {item.contact_email || "Není uveden"}
                    </span>
                    {item.contact_email && (
                      <a 
                        href={`mailto:${item.contact_email}?subject=Zájem o inzerát: ${item.title}`}
                        className="text-blue-500 hover:underline font-bold"
                      >
                        Napsat
                      </a>
                    )}
                  </div>
                )}
              </div>
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
