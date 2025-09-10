"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { initMockServer } from "@/mocks/wsServer";

interface ClientProviderProps {
    children: React.ReactNode;
}
const ClientProviders: React.FC<ClientProviderProps> = ({ children }) => {
    try {
        initMockServer();
    } catch (error) {
        console.error("initMockServer error", error);
    }

    return <Provider store={store}>{children}</Provider>;
};

export default ClientProviders;
