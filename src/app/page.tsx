"use client";

import ProductsList from "@/components/ProductList";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Page() {
    useWebSocket();
    return (
        <main className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <ProductsList />
        </main>
    );
}
