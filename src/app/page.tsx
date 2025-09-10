import ProductsList from "@/components/ProductList";

export default function Page() {
    return (
        <main className="p-5 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <ProductsList />
        </main>
    );
}
