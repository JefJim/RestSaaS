"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Store, MapPin, ShieldCheck, Check, LogOut, User, CreditCard, HelpCircle } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

function ContextDropdown<T extends { id?: string; restaurantId?: string; name: string }>({
  label,
  icon,
  current,
  options,
  onSelect,
  getId
}: {
  label: string;
  icon: React.ReactNode;
  current: string;
  options: T[];
  onSelect: (item: T) => void;
  getId: (item: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-sm font-semibold
          ${open ? "bg-primary/10 border-primary/30 text-primary" : "bg-background/50 border-border/30 text-foreground/70 hover:border-primary/20 hover:text-foreground"}`}
      >
        <span className="text-primary/70">{icon}</span>
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-[9px] uppercase font-black text-foreground/40">{label}</span>
          <span className="truncate max-w-[110px]">{current || "—"}</span>
        </div>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && options.length > 0 && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-white dark:bg-zinc-950 border border-border rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/10">
          <div className="p-1.5 space-y-0.5 max-h-60 overflow-y-auto">
            {options.map((item) => {
              const id = getId(item);
              const isActive = id === (getId({ ...item } as T));
              return (
                <button
                  key={id}
                  onClick={() => { onSelect(item); setOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-primary/5 text-foreground/70 hover:text-foreground text-left"
                >
                  <span className="truncate">{item.name}</span>
                  {current === item.name && <Check size={14} className="text-primary flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const router = useRouter();
  const { activeRestaurant, restaurants, setActiveRestaurant, activeBranch, branches, setActiveBranch } = useTenant();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState("Personal");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("restsaas_token");
    if (!token) { router.push("/login"); return; }

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const roleClaim = payload["RestaurantRole"] || payload["role"] || "Staff";
      setRole(roleClaim === "Owner" ? "Dueño" : roleClaim === "Admin" ? "Administrador" : "Personal");
    } catch { 
      // Do nothing, handled by auth guard
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6 z-40 sticky top-0 shadow-sm flex-shrink-0">
      <h1 className="text-base font-black tracking-tight text-foreground hidden lg:block">Panel de Administración</h1>

      <div className="flex items-center gap-2 flex-wrap ml-auto">
        {/* Restaurant Dropdown */}
        <ContextDropdown
          label="Restaurante"
          icon={<Store size={14} />}
          current={activeRestaurant?.name || ""}
          options={restaurants}
          getId={(r) => r.restaurantId!}
          onSelect={(r) => setActiveRestaurant(r)}
        />

        {/* Branch Dropdown */}
        <ContextDropdown
          label="Sucursal"
          icon={<MapPin size={14} />}
          current={activeBranch?.name || localStorage.getItem("restsaas_selected_branch_name") || "Principal"}
          options={branches.map(b => ({ ...b, restaurantId: b.id }))}
          getId={(b) => b.id!}
          onSelect={(b) => setActiveBranch({ id: b.id!, name: b.name, address: b.address || "" })}
        />

        {/* Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 border border-border/30 rounded-xl">
          <ShieldCheck size={14} className="text-primary/70" />
          <div className="flex flex-col leading-none text-left">
            <span className="text-[9px] uppercase font-black text-foreground/40">Rol</span>
            <span className="text-sm font-semibold text-foreground/70">{role}</span>
          </div>
        </div>

        {/* Avatar Dropdown */}
        <div className="relative ml-1" ref={userMenuRef}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-md border-2 border-background flex items-center justify-center text-white font-bold text-sm hover:scale-105 transition-transform"
          >
            {activeRestaurant?.name?.[0] ?? "?"}
          </button>

          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-zinc-950 border border-border rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/10">
              <div className="p-4 border-b border-border/50 bg-foreground/[0.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Cuenta</p>
                <p className="text-sm font-bold text-foreground truncate">{activeRestaurant?.name || "Administrador"}</p>
                <p className="text-[10px] text-foreground/50 font-medium truncate">{localStorage.getItem("restsaas_user_email") || "owner@tablehive.com"}</p>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                <button onClick={() => { router.push("/admin/profile"); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/5 text-foreground/70 hover:text-foreground">
                  <User size={14} className="text-primary/70" /> Mi Perfil
                </button>
                <button onClick={() => { router.push("/admin/dashboard/subscription"); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/5 text-foreground/70 hover:text-foreground">
                  <CreditCard size={14} className="text-primary/70" /> Facturación
                </button>
                <button onClick={() => { router.push("/help"); setUserMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-primary/5 text-foreground/70 hover:text-foreground">
                  <HelpCircle size={14} className="text-primary/70" /> Centro de Ayuda
                </button>
                <div className="h-px bg-border/50 my-1 mx-2" />
                <button 
                  onClick={() => { localStorage.removeItem("restsaas_token"); window.location.href = "/login"; }} 
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={14} /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
