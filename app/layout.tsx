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
            <head>
                <link rel="icon" href="https://astrid.place/favicon.ico" />
            </head>
            <body className="dark:bg-black dark:text-white">
                <Navbar />
                {children}
            </body>
        </html>
    );
}
