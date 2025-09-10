import "./globals.css";
import ClientProviders from "@/providers/clientProviders";

export const metadata = {
    title: "Realtime Store",
};

interface RootLayoutProps {
    children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <ClientProviders>{children}</ClientProviders>
            </body>
        </html>
    );
};

export default RootLayout;
