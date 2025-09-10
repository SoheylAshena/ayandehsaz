"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/store/productsSlice";

interface EditableProductProps {
    product: Product;
    send?: (m: any) => void;
    onLocalUpdate: (p: Product) => void;
    onLocalDelete: (id: string) => void;
}

const EditableProduct: React.FC<EditableProductProps> = ({ product, send, onLocalUpdate, onLocalDelete }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(product.title);
    const [price, setPrice] = useState(String(product.price));
    const [stock, setStock] = useState(String(product.stock));

    // keep local fields in sync if product changes externally
    useEffect(() => {
        setTitle(product.title);
        setPrice(String(product.price));
        setStock(String(product.stock));
    }, [product.title, product.price, product.stock]);

    const save = () => {
        const updated: Product = {
            ...product,
            title: title.trim() || product.title,
            price: Number(price) || 0,
            stock: Number(stock) || 0,
        };
        // optimistic local update
        onLocalUpdate(updated);
        send?.({ type: "UPDATE", payload: updated });
        setEditing(false);
    };

    const remove = () => {
        if (!confirm("Delete product?")) return;
        onLocalDelete(product.id);
        send?.({ type: "DELETE", payload: { id: product.id } });
    };

    return (
        <div className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex-1">
                {editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input className="border p-2 w-full" value={title} onChange={(e) => setTitle(e.target.value)} />
                        <input
                            className="border p-2 w-full"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                        <input
                            className="border p-2 w-full"
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                        />
                    </div>
                ) : (
                    <div>
                        <div className="font-medium">{product.title}</div>
                        <div className="text-sm text-gray-500">
                            ${product.price.toFixed(2)} · {product.stock} in stock
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {editing ? (
                    <>
                        <button className="px-3 py-1 border" onClick={save}>
                            Save
                        </button>
                        <button
                            className="px-3 py-1 border"
                            onClick={() => {
                                setEditing(false);
                                setTitle(product.title);
                                setPrice(String(product.price));
                                setStock(String(product.stock));
                            }}
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button className="px-3 py-1 border" onClick={() => setEditing(true)}>
                            Edit
                        </button>
                        <button className="px-3 py-1 border text-red-600" onClick={remove}>
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default EditableProduct;
