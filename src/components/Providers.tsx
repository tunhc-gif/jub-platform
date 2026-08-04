"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { VesselDataProvider } from "@/context/VesselDataContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <VesselDataProvider>{children}</VesselDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
