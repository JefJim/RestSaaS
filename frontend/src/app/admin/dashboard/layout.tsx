"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Utensils, CalendarDays, ShoppingBag, Settings, LogOut } from "lucide-react";

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

  if (!mounted) return null; // Avoid hydration mismatch

  const handleLogout = () => {
    localStorage.removeItem("restsaas_token");
    router.push("/admin");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      {/* Sidebar */}
      <aside className="w-64 glass dark:glass-dark border-r border-border/50 flex flex-col justify-between hidden md:flex transition-all duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex flex-col items-center justify-center text-white font-bold shadow-lg">
              TH
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">TableHive</span>
          </div>
          
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all font-medium">
              <LayoutDashboard size={20} />
              <span>Resumen</span>
            </Link>
            <Link href="/admin/dashboard/menu" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/10 text-primary font-medium shadow-inner transition-all hover:bg-primary/20">
              <Utensils size={20} />
              <span>Menú</span>
            </Link>
            <Link href="/admin/dashboard/reservations" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all font-medium">
              <CalendarDays size={20} />
              <span>Reservaciones</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all font-medium">
              <ShoppingBag size={20} />
              <span>Pedidos</span>
            </Link>
            <Link href="/admin/dashboard/subscription" className="flex items-center gap-3 px-4 py-3 rounded-2xl text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all font-medium">
              <LogOut size={20} className="rotate-180" />
              <span>Suscripción</span>
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-border/50">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-2xl text-red-500/80 hover:text-red-500 hover:bg-red-500/10 transition-all font-medium">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <header className="h-20 glass dark:glass-dark border-b border-border/50 flex items-center justify-between px-8 z-10 sticky top-0 shadow-sm">
          <h1 className="text-xl font-bold text-foreground tracking-tight">Panel Principal</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-foreground/60 hidden sm:block">Administrador</span>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-md transform hover:scale-105 transition-transform cursor-pointer border-2 border-background"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 z-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
