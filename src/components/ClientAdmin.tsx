"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import ProductsList from "@/components/ProductList";
import { useWebSocket } from "@/hooks/useWebSocket";
import { v4 as uuidv4 } from "uuid";

export default function ClientAdmin() {
    const products = useSelector((state: RootState) => state.products.products);

    const { send } = useWebSocket();

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState<string>("20");
    const [stock, setStock] = useState<string>("10");
    const [error, setError] = useState<string>("");

    const add = () => {
        if (!title.trim()) {
            return alert("Title required");
        }

        const newProduct = {
            id: uuidv4(),
            title: title.trim(),
            price: Number(price) || 0,
            stock: Number(stock) || 0,
        };

        const duplicate = products.some((product) => newProduct.title.toLowerCase() === product.title.toLowerCase());
        if (duplicate) {
            setError("Item already exists");
            return;
        }

        // send ADD to server
        send({ type: "ADD", payload: newProduct });
        setTitle("");
        setPrice("20");
        setStock("10");
    };

    return (
        <div>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2">
                <input
                    className="border p-2 col-span-1 sm:col-span-2"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError("");
                    }}
                />
                <input
                    className="border p-2"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <input className="border p-2" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                <div className="sm:col-span-4">
                    <button className="mt-2 bg-blue-600 text-white px-4 py-2" onClick={add}>
                        Add Product
                    </button>
                </div>
            </div>

            <p className="text-red-600">{error}</p>

            <p className="text-sm text-gray-600 mb-4">
                Edit or delete products below to update all clients in realtime.
            </p>

            <ProductsList admin send={send} />
        </div>
    );
}
