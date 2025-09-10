import { Server } from "mock-socket";
import type { Product } from "@/store/productsSlice";

/*
╒═══════════════════════════════════════════════════════════════════════╕
      ⚜  Variables and Constants  ⚜ 
╘═══════════════════════════════════════════════════════════════════════╛
*/
export const WS_URL = "ws://localhost:8080";
export const STORAGE_KEY = "mock_ws_products_v1";
export const BC_NAME = "mock-ws-channel";

let products: Product[] = [
    { id: "p1", title: "Blue T-Shirt", price: 19.99, stock: 10 },
    { id: "p2", title: "Red Hoodie", price: 39.99, stock: 5 },
];

let server: Server | null = null;
let Channel: BroadcastChannel | null = null;

const connectedSockets = new Set<any>();

/*
╒═══════════════════════════════════════════════════════════════════════╕
      ⚜  Utilities  ⚜  —  Utility functions for ws server    
╘═══════════════════════════════════════════════════════════════════════╛
*/

/*   ⋆⋆⋆  Save products variable data to local storage  ⋆⋆⋆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function saveProductsToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (error) {
        console.warn("failed to save products to storage", error);
    }
}

/*   ⋆⋆⋆  Load data from localstorage  ⋆⋆⋆
If not available, set data from products variable to local storage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            products = parsed;
        } else {
            // Save initial products data to storage when there is no data in it
            saveProductsToStorage();
        }
    } catch (error) {
        console.warn("failed to load products from storage", error);
    }
}

/*   ⋆⋆⋆  Sync all connected sockets  ⋆⋆⋆
If one connection gives an error, it gets deleted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function syncSockets() {
    const msg = JSON.stringify({ type: "SYNC", payload: products });
    Array.from(connectedSockets).forEach((socket) => {
        try {
            socket.send(msg);
        } catch (e) {
            connectedSockets.delete(socket);
        }
    });
}

/*   ⋆⋆⋆  BroadCasts to tabs  ⋆⋆⋆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function broadcastToTabs() {
    Channel?.postMessage({ type: "SYNC", payload: products });
}

/*   ⋆⋆⋆  BroadCasts to sync everything  ⋆⋆⋆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function broadcastSyncAll() {
    saveProductsToStorage();
    syncSockets();
    broadcastToTabs();
}

/*
╒═══════════════════════════════════════════════════════════════════════╕
      ⚜  Initialize Mock server  ⚜     
╘═══════════════════════════════════════════════════════════════════════╛
*/

export function initMockServer() {
    // return if windows is undefined or server is intialized before
    if (typeof window === "undefined") return;
    if (server) return;

    /*   ⋆⋆⋆  Initialize BroadcastChannel  ⋆⋆⋆
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    try {
        Channel = new BroadcastChannel(BC_NAME);
        Channel.onmessage = (event) => {
            const msg = event.data;

            if (msg && msg.type === "SYNC" && Array.isArray(msg.payload)) {
                products = msg.payload;
                saveProductsToStorage();
                syncSockets();
            }
        };
    } catch (error) {
        // BroadcastChannel might not be available in some envs; fallback to storage events
        Channel = null;
        console.warn("BroadcastChannel not available, falling back to storage events");
        window.addEventListener("storage", (event) => {
            if (event.key === STORAGE_KEY && event.newValue) {
                const parsed = JSON.parse(event.newValue);
                if (Array.isArray(parsed)) {
                    products = parsed;
                    syncSockets();
                }
            }
        });
    }

    /*   ⋆⋆⋆  load initial products from localStorage  ⋆⋆⋆
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    loadFromStorage();

    server = new Server(WS_URL);
    window.__MOCK_WS_INITIALIZED = true;

    server.on("connection", (socket) => {
        connectedSockets.add(socket);

        // send product data to the connecting socket
        socket.send(JSON.stringify({ type: "SYNC", payload: products }));

        // remove on close
        socket.on("close", () => connectedSockets.delete(socket));

        socket.on("message", (raw) => {
            try {
                const msg = JSON.parse(String(raw));
                const { type, payload } = msg;

                if (type === "ADD") {
                    products = [payload, ...products];
                    broadcastSyncAll();
                } else if (type === "UPDATE") {
                    products = products.map((p) => (p.id === payload.id ? { ...p, ...payload } : p));
                    broadcastSyncAll();
                } else if (type === "DELETE") {
                    products = products.filter((p) => p.id !== payload.id);
                    broadcastSyncAll();
                } else if (type === "SYNC_REQUEST") {
                    // reply only to this socket
                    socket.send(JSON.stringify({ type: "SYNC", payload: products }));
                }
            } catch (e) {
                console.error("mock ws server parse error", e);
            }
        });
    });
}
