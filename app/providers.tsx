"use client";

import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Handle hydration
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Toaster position="top-right" />
      {children}
    </ThemeProvider>
  );
}