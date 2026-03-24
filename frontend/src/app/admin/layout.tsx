"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Menu as MenuIcon,
  Calendar,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  CreditCard
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLogged, setIsLogged] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("Free"); // Mocked for now, can be fetched from API

  useEffect(() => {
    const token = localStorage.getItem("restsaas_token");
    setIsLogged(!!token);
    // In a real app, we would fetch the user's plan here
    // setUserPlan(fetchedPlan);
  }, [pathname]);

  const isLoginPage = pathname === "/admin";
  const shouldShowSidebar = isLogged && !isLoginPage;

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} />, minPlan: "Free" },
    { name: "Menú Digital", href: "/admin/dashboard/menu", icon: <MenuIcon size={20} />, minPlan: "Free" },
    { name: "Reservaciones", href: "/admin/dashboard/reservations", icon: <Calendar size={20} />, minPlan: "Pro" },
    { name: "Suscripción", href: "/admin/dashboard/subscription", icon: <CreditCard size={20} />, minPlan: "Free" },
    { name: "Configuración", href: "/admin/dashboard/settings", icon: <Settings size={20} />, minPlan: "Free" },
  ];

  // Filter items by plan: Free sees everything but Pro-only features are locked/hidden
  // Here we hide "Reservaciones" if the plan is Free
  const filteredItems = menuItems.filter(item => {
    if (item.minPlan === "Pro" && userPlan === "Free") return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden" suppressHydrationWarning={true}>
      {/* Premium Sidebar - Only visible if logged in and NOT on login page */}
      {shouldShowSidebar && (
        <aside className="w-72 bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col z-50 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                unoptimized
                priority
                style={{ height: 'auto' }}
                className="brightness-0 invert"
              />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter text-foreground">TableHive</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none">Admin Portal</p>
            </div>
          </div>

          <nav className="flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto hide-scrollbar">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
                    ${isActive
                      ? "bg-primary text-white shadow-xl shadow-primary/20 translate-x-1"
                      : "text-foreground/60 hover:bg-primary/5 hover:text-primary"}`}
                >
                  <div className="flex items-center gap-3" suppressHydrationWarning={true}>
                    <span className={`${isActive ? "text-white" : "text-foreground/40 group-hover:text-primary transition-colors"}`}>
                      {item.icon}
                    </span>
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-white/70" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="glass dark:glass-dark rounded-2xl p-4 mb-4 border border-primary/10" suppressHydrationWarning={true}>
              <div className="flex items-center gap-2 mb-2" suppressHydrationWarning={true}>
                <TrendingUp size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Plan Actual</span>
              </div>
              <p className="text-sm font-bold text-foreground">Plan {userPlan}</p>
              <div className="w-full bg-foreground/10 h-1.5 rounded-full mt-2 overflow-hidden" suppressHydrationWarning={true}>
                <div className={`${userPlan === "Enterprise" ? "w-[100%]" : "w-[45%]"} bg-primary h-full transition-all duration-1000`} suppressHydrationWarning={true} />
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("restsaas_token");
                window.location.href = "/admin";
              }}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/5 transition-colors font-bold text-sm"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto relative ${!shouldShowSidebar ? "w-full" : ""}`}>
        {/* Subtle background blur blobs */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        {shouldShowSidebar && <div className="fixed bottom-0 left-72 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>}

        <div className="p-8 md:p-12" suppressHydrationWarning={true}>
          {children}
        </div>
      </main>
    </div>
  );
}
