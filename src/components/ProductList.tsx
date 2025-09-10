"use client";

import { useDispatch, useSelector } from "react-redux";
import { updateProduct, deleteProduct } from "../store/productsSlice";
import EditableProduct from "./EditableProduct";
import { RootState } from "@/store/store";

interface ProductsListProps {
    admin?: boolean;
    send?: (msg: any) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ admin, send }) => {
    const products = useSelector((state: RootState) => state.products.products);
    const dispatch = useDispatch();

    if (!admin) {
        // Read-only render
        return (
            <div className="grid gap-4">
                {products.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 bg-gray-100 rounded">
                        <div>
                            <div className="font-medium">{p.title}</div>
                            <div className="text-sm text-gray-500">
                                ${p.price.toFixed(2)} · {p.stock} in stock
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Admin UI: editable rows
    return (
        <div className="grid gap-4">
            {products.map((p) => (
                <EditableProduct
                    key={p.id}
                    product={p}
                    send={send}
                    onLocalUpdate={(prod) => dispatch(updateProduct(prod))}
                    onLocalDelete={(id) => dispatch(deleteProduct({ id }))}
                />
            ))}
        </div>
    );
};

export default ProductsList;
