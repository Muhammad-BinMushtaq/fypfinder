// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";



const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });



export default function RootLayout({ children }: { children: React.ReactNode }) {


    return (
        <html lang="en">
            <head>

            </head>
            <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 text-gray-900 antialiased`}>
                <div className="flex min-h-screen flex-col">

                    <main className="flex-1">{children}</main>

                </div>

            </body>
        </html>
    );
}