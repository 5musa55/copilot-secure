"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js"; 

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditAd({ params }: { params: Promise<{ id: string }> }) {
    const [adId, setAdId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        params.then((resolvedParams) => {
            setAdId(resolvedParams.id);
        });
    }, [params]);

    useEffect(() => {
        if (!adId) return;

        const fetchAd = async () => {
            const { data, error } = await supabase
                .from("items")
                .select("*")
                .eq("id", adId)
                .single();

            if (error) {
                setError("Nepodařilo se načíst inzerát.");
            } else if (data) {
                setTitle(data.title);
                setPrice(data.price.toString());
                setDescription(data.description);
                setExistingImages(data.images || []);
            }
        };

        fetchAd();
    }, [adId]);

    const handleRemoveExistingImage = (indexToRemove: number) => {
        setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleRemoveNewFile = (indexToRemove: number) => {
        setNewFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleEditAd = async (e: React.FormEvent<HTMLFormElement>) => {
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
                setError("Nejste přihlášeni.");
                setIsSubmitting(false);
                return;
            }

            const uploadedImageUrls: string[] = [];

            if (newFiles.length > 0) {
                for (const file of newFiles) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${user.id}/${fileName}`; 

                    const { error: uploadError } = await supabase.storage
                        .from('images')
                        .upload(filePath, file);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('images')
                            .getPublicUrl(filePath);
                        uploadedImageUrls.push(publicUrl);
                    } else {
                        console.error("Chyba nahrávání:", uploadError);
                    }
                }
            }

            const finalImages = [...existingImages, ...uploadedImageUrls];

            const { error: updateError } = await supabase
                .from("items")
                .update({
                    title: title.trim(),
                    price: priceValue,
                    description: description.trim(),
                    images: finalImages,
                })
                .eq("id", Number(adId));

            if (updateError) {
                setError("Nepodařilo se upravit inzerát. Zkuste to prosím znovu.");
            } else {
                router.push("/my-ads");
                router.refresh();
            }
        } catch (err) {
            console.error("Chyba při úpravě inzerátu:", err);
            setError("Něco se pokazilo. Zkuste to prosím znovu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 py-10">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">
                    Upravit inzerát
                </h1>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                
                {!adId ? (
                    <p className="text-center text-gray-500">Načítám data...</p>
                ) : (
                    <form onSubmit={handleEditAd} className="space-y-4">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Obrázky
                            </label>
                            
                            {existingImages.length > 0 && (
                                <div className="flex gap-2 flex-wrap mb-4">
                                    {existingImages.map((url, index) => (
                                        <div key={`existing-${index}`} className="relative w-20 h-20 group">
                                            <img src={url} alt="Nahraný obrázek" className="w-full h-full object-cover rounded border border-gray-300 dark:border-gray-600" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow hover:bg-red-600"
                                                title="Smazat obrázek"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {newFiles.length > 0 && (
                                <div className="flex gap-2 flex-wrap mb-4">
                                    {newFiles.map((file, index) => (
                                        <div key={`new-${index}`} className="relative w-20 h-20">
                                            <img src={URL.createObjectURL(file)} alt="Nový obrázek" className="w-full h-full object-cover rounded border border-green-400 opacity-80" />
                                            <span className="absolute bottom-0 left-0 right-0 bg-green-500 bg-opacity-80 text-white text-[10px] text-center">Nový</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNewFile(index)}
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
                                        setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
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
                            {isSubmitting ? "Ukládám změny..." : "Uložit změny"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
