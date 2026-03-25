"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Menu as MenuIcon, Calendar, Settings, LogOut,
  ChevronRight, TrendingUp, CreditCard, User, GitBranch, ShoppingBag, Table2, Globe, Store
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { TenantProvider, useTenant } from "@/context/TenantContext";
import { TopBar } from "@/components/TopBar";

const navGroups = [
  {
    label: "Principal",
    items: [{ name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Operaciones",
    items: [
      { name: "Menú Digital", href: "/admin/dashboard/menu", icon: MenuIcon },
      { name: "Reservaciones", href: "/admin/dashboard/reservations", icon: Calendar },
      { name: "Órdenes", href: "/admin/dashboard/orders", icon: ShoppingBag },
      { name: "Mesas", href: "/admin/dashboard/tables", icon: Table2 },
    ]
  },
  {
    label: "Gestión",
    items: [
      { name: "Personal", href: "/admin/dashboard/staff", icon: User },
      { name: "Sucursales", href: "/admin/branches", icon: GitBranch },
      { name: "Suscripción", href: "/admin/dashboard/subscription", icon: CreditCard },
      { name: "Restaurantes", href: "/admin/restaurants/new", icon: Store },
    ]
  },
  {
    label: "Configuración",
    items: [
      { name: "Configuración", href: "/admin/dashboard/settings", icon: Settings },
      { name: "Sitio Público", href: "/admin/dashboard/public-site", icon: Globe },
    ]
  }
];

// Inner sidebar — must be inside TenantProvider to use useTenant()
function SidebarContent({ pathname }: { pathname: string }) {
  const { activeRestaurant, plan } = useTenant();

  const planBarWidth =
    plan === "Premium" ? "w-full" :
    plan === "Pro Tier" ? "w-2/3" :
    "w-1/3";

  return (
    <aside className="w-[260px] flex-shrink-0 bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col z-50 overflow-hidden">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-border/50">
        <div className="w-10 h-10 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          <Image src="/logo.png" alt="Logo" width={40} height={40} unoptimized priority
            style={{ width: '100%', height: 'auto' }}
            className="brightness-0 invert drop-shadow-[0_0_12px_rgba(124,58,237,0.6)] scale-[2.2]"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-black tracking-tighter text-foreground truncate">TableHive</h2>
          <p className="text-[9px] font-bold uppercase tracking-widest text-primary leading-none truncate">
            {activeRestaurant?.name || "Admin Portal"}
          </p>
        </div>
      </div>

      {/* Grouped Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto hide-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-[9px] font-black uppercase tracking-widest text-foreground/30">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link key={item.name} href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-foreground/60 hover:bg-primary/5 hover:text-primary"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`${isActive ? "text-white" : "text-foreground/40 group-hover:text-primary transition-colors"}`}>
                        <Icon size={16} />
                      </span>
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={12} className="text-white/70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan + Logout */}
      <div className="p-3 border-t border-border/50 space-y-2">
        <div className="glass dark:glass-dark rounded-xl p-3 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-wider text-foreground/50">Plan Actual</span>
          </div>
          <p className="text-xs font-bold text-foreground">{plan || "—"}</p>
          <div className="w-full bg-foreground/10 h-1 rounded-full mt-1.5 overflow-hidden">
            <div className={`${planBarWidth} bg-primary h-full transition-all duration-1000`} />
          </div>
        </div>

        <button
          onClick={() => { localStorage.removeItem("restsaas_token"); window.location.href = "/login"; }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-500/5 transition-colors font-bold text-sm"
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Use mounted + useEffect pattern to avoid SSR/client hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(!!localStorage.getItem("restsaas_token"));
    setMounted(true);
  }, []);

  const isLoginPage = pathname === "/login";
  const shouldShowSidebar = mounted && isLogged && !isLoginPage;

  return (
    <TenantProvider>
      <div className="flex h-screen bg-background font-sans overflow-hidden">
        {shouldShowSidebar && <SidebarContent pathname={pathname} />}
        <main className={`flex-1 overflow-y-auto relative flex flex-col ${!shouldShowSidebar ? "w-full" : ""}`}>
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
          {shouldShowSidebar && <TopBar />}
          {children}
        </main>
      </div>
    </TenantProvider>
  );
}
