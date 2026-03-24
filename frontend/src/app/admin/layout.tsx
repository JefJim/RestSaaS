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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Menú Digital", href: "/admin/dashboard/menu", icon: <MenuIcon size={20} /> },
    { name: "Reservaciones", href: "/admin/dashboard/reservations", icon: <Calendar size={20} /> },
    { name: "Suscripción", href: "/admin/dashboard/subscription", icon: <CreditCard size={20} /> },
    { name: "Configuración", href: "/admin/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden" suppressHydrationWarning={true}>
      {/* Premium Sidebar */}
      <aside className="w-72 bg-surface/80 backdrop-blur-xl border-r border-border flex flex-col z-50">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="brightness-0 invert" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter text-foreground">TableHive</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary leading-none">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1.5 overflow-y-auto hide-scrollbar">
          {menuItems.map((item) => {
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
                <div className="flex items-center gap-3">
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
          <div className="glass dark:glass-dark rounded-2xl p-4 mb-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50">Plan Actual</span>
            </div>
            <p className="text-sm font-bold text-foreground">Plan Enterprise</p>
            <div className="w-full bg-foreground/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-primary h-full w-[85%]" />
            </div>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/5 transition-colors font-bold text-sm">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle background blur blobs */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-72 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <div className="p-8 md:p-12" suppressHydrationWarning={true}>
          {children}
        </div>
      </main>
    </div>
  );
}
