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
            }
        };

        fetchAd();
    }, [adId]);

    const handleEditAd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(""); 

        if (!title.trim() || !price.trim() || !description.trim()) {
            setError("Vyplňte prosím všechny údaje.");
            return;
        }
        const priceValue = Number(price);
        if (isNaN(priceValue) || priceValue <= 0) {
            setError("Cena musí být kladné číslo.");
            return;
        }

        try {
            const { error: updateError } = await supabase
                .from("items")
                .update({
                    title: title.trim(),
                    price: priceValue,
                    description: description.trim(),
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
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
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
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            Uložit změny
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

