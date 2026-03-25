"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("restsaas_token");
    if (!token) { router.push("/login"); return; }

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload["RestaurantId"]) router.push("/select-restaurant");
    } catch { router.push("/login"); }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <div className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
        {children}
      </div>
    </div>
  );
}
