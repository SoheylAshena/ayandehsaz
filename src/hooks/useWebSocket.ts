"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { WS_URL, BC_NAME, STORAGE_KEY } from "@/mocks/wsServer";
import { setProducts } from "@/store/productsSlice";

/*   ⋆⋆⋆  Wait for mock server to be ready  ⋆⋆⋆
  check server ready state in every 500ms till it is ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function waitForMockReady(timeout = 2000): Promise<boolean> {
    const start = Date.now();
    return new Promise((resolve) => {
        const check = () => {
            if (window.__MOCK_WS_INITIALIZED) return resolve(true);
            if (Date.now() - start > timeout) return resolve(false);
            setTimeout(check, 500);
        };
        check();
    });
}

export function useWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const bcRef = useRef<BroadcastChannel | null>(null);
    const dispatch = useDispatch();

    useEffect(() => {
        let mounted = true;
        let reconnectTimer: number | undefined;

        /*
        ╒═══════════════════════════════════════════════════════════════════════╕
              ⚜  Connetct to WS server  ⚜     
        ╘═══════════════════════════════════════════════════════════════════════╛
        */
        const connect = async () => {
            // If WS server is ready, this resolves true
            const ready = await waitForMockReady();

            if (!mounted) return;

            if (!ready) {
                console.warn("Mock WS server not ready; Reconnectiong...");
            }

            /*   ⋆⋆⋆  Title  ⋆⋆⋆
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
            try {
                // Listen to BroadcastChannel (syncs across tabs)
                try {
                    bcRef.current = new BroadcastChannel(BC_NAME);
                    bcRef.current.onmessage = (event) => {
                        const msg = event.data;
                        if (msg && msg.type === "SYNC" && Array.isArray(msg.payload)) {
                            dispatch(setProducts(msg.payload));
                        }
                    };
                } catch (e) {
                    bcRef.current = null;
                    // fallback handled by storage events in server
                    window.addEventListener("storage", (event) => {
                        if (event.key === STORAGE_KEY && event.newValue) {
                            const parsed = JSON.parse(event.newValue);
                            dispatch(setProducts(parsed));
                        }
                    });
                }

                const ws = new WebSocket(WS_URL);
                wsRef.current = ws;

                ws.onopen = () => {
                    ws.send(JSON.stringify({ type: "SYNC_REQUEST" }));
                };

                ws.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === "SYNC") {
                            dispatch(setProducts(msg.payload));
                        }
                    } catch (error) {
                        console.error("ws parse", error);
                    }
                };

                ws.onclose = () => {
                    wsRef.current = null;
                    if (!mounted) return;
                    reconnectTimer = window.setTimeout(() => connect(), 500);
                };

                ws.onerror = (error) => {
                    console.warn("WebSocket error", error);
                };
            } catch (error) {
                console.error("WebSocket constructor failed", error);
                if (mounted) {
                    reconnectTimer = window.setTimeout(() => connect(), 500);
                }
            }
        };

        connect();

        return () => {
            mounted = false;

            if (wsRef.current) {
                wsRef.current.close();
            }

            if (bcRef.current) {
                bcRef.current.close();
            }

            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
            }
        };
    }, [dispatch]);

    const send = (data: any) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        } else {
            console.warn("WS not open, Try again...", data);
        }
    };

    return { send };
}
