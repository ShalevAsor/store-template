import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { STORE_SETTING_KEYS } from "@/constants/storeSettings";
import { getSetting } from "@/lib/storeSettings";
import React from "react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [storeName, storeDescription] = await Promise.all([
    getSetting(STORE_SETTING_KEYS.STORE_NAME),
    getSetting(STORE_SETTING_KEYS.STORE_DESCRIPTION),
  ]);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar storeName={storeName} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer storeName={storeName} />
    </div>
  );
}
