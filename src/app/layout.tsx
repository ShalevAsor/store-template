import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { getSetting } from "@/lib/storeSettings";
import { STORE_SETTING_KEYS } from "@/constants/storeSettings";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const [storeName, storeDescription] = await Promise.all([
    getSetting(STORE_SETTING_KEYS.STORE_NAME),
    getSetting(STORE_SETTING_KEYS.STORE_DESCRIPTION),
  ]);

  return {
    title: storeName,
    description: storeDescription,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
