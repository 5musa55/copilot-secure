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
  const [files, setFiles] = useState<File[]>([]); 
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setIsSubmitting(true);

    if (!title.trim() || !price.trim() || !description.trim()) {
      setError("Vyplňte prosím všechny údaje.");
      setIsSubmitting(false);
      return;
    }
    
    const priceValue = Number(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Cena musí být kladné číslo.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Pro přidání inzerátu se musíte přihlásit.");
        setIsSubmitting(false);
        return;
      }

      const uploadedImageUrls: string[] = [];
      
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`; 

          const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

          if (uploadError) {
            console.error("Chyba při nahrávání obrázku:", uploadError);
            setError("Nepodařilo se nahrát obrázky. Zkontrolujte nastavení Storage.");
            setIsSubmitting(false);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
            
          uploadedImageUrls.push(publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("items").insert([
        {
          title: title.trim(),
          price: priceValue,
          description: description.trim(),
          user_id: user.id,
          images: uploadedImageUrls, 
          contact_email: user.email,
        },
      ]);

      if (insertError) {
        console.error("Chyba DB:", insertError);
        setError("Nepodařilo se přidat inzerát. Zkuste to prosím znovu.");
      } else {
        router.push("/my-ads"); 
        router.refresh();
      }
    } catch (err) {
      console.error("Kritická chyba při přidávání inzerátu:", err);
      setError("Něco se pokazilo. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
          Přidat nový inzerát
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        <form onSubmit={handleAddAd} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cena (Kč)
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Popis
            </label>
            <textarea
              id="description"
              placeholder="Popis inzerátu"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 h-24"
              required
            />
          </div>

          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Obrázky
            </label>
            
            {files.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                    {files.map((file, index) => (
                        <div key={index} className="relative w-20 h-20">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Náhled ${index + 1}`} 
                              className="w-full h-full object-cover rounded border border-gray-300 dark:border-gray-600" 
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            />
          </div> 

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-white py-2 px-4 rounded transition ${
              isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? "Přidávám..." : "Přidat inzerát"}
          </button>
        </form>
      </div>
    </div>
  );
}
