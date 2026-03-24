"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("restsaas_token");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header className="h-20 bg-surface/40 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
        <h1 className="text-xl font-bold text-foreground tracking-tight">Panel Principal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground/60 hidden sm:block">Restaurante Activo</span>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-md border-2 border-background"></div>
        </div>
      </header>
      <div className="flex-1 p-4 md:p-8 animate-in fade-in duration-700">
        {children}
      </div>
    </div>
  );
}
