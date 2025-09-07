"use client";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "./QueryProvider";
import { ModalProvider } from "./ModalProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => (
  <QueryProvider>
    {children}
    <ModalProvider />
    <Toaster position="bottom-right" richColors closeButton />
  </QueryProvider>
);
