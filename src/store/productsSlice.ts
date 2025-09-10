import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Product = {
    id: string;
    title: string;
    price: number;
    stock: number;
};

type State = { products: Product[] };

const initialState: State = { products: [] };

const slice = createSlice({
    name: "products",
    initialState,
    reducers: {
        setProducts(state, action: PayloadAction<Product[]>) {
            state.products = action.payload;
        },
        addProduct(state, action: PayloadAction<Product>) {
            state.products.unshift(action.payload);
        },
        updateProduct(state, action: PayloadAction<Product>) {
            state.products = state.products.map((p) => (p.id === action.payload.id ? action.payload : p));
        },
        deleteProduct(state, action: PayloadAction<{ id: string }>) {
            state.products = state.products.filter((p) => p.id !== action.payload.id);
        },
    },
});

export const { setProducts, addProduct, updateProduct, deleteProduct } = slice.actions;
export default slice.reducer;
