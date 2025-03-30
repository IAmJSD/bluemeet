import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "Bluemeet",
    description: "Meet people on Bluesky",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="dark:bg-black dark:text-white">
                <Navbar />
                {children}
            </body>
        </html>
    );
}
