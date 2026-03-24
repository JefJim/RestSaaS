"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, TrendingUp, Users, Eye, Settings } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  menuCount: number;
  reservationsToday: number;
  ordersToday: number;
  isActive: boolean;
  subscription: {
    planName: string;
    status: string;
    endDate: string | null;
    isTrial: boolean;
  };
}

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("restsaas_token");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
        
        // Parallel fetch for restaurant info and stats
        const [resMe, resStats] = await Promise.all([
          fetch(`${apiUrl}/api/restaurants/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          }),
          fetch(`${apiUrl}/api/dashboard/stats`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);

        if (!resMe.ok || !resStats.ok) {
          if (resMe.status === 401 || resStats.status === 401) {
            throw new Error("Sesión expirada o sin permisos. Por favor cierra sesión e ingresa de nuevo.");
          }
          throw new Error("Error al cargar los datos del dashboard.");
        }

        const [jsonMe, jsonStats] = await Promise.all([resMe.json(), resStats.json()]);
        setData(jsonMe);
        setStats(jsonStats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data || !stats) {
    return (
      <div className="p-10 glass dark:glass-dark rounded-3xl border border-red-500/20 bg-red-500/5 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
          <Settings size={32} />
        </div>
        <h3 className="font-black text-2xl mb-4 text-white">Error de acceso</h3>
        <p className="text-white/60 mb-8">{error || "No se pudo cargar la información."}</p>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
          className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
        >
          Cerrar Sesión e Intentar de Nuevo
        </button>
      </div>
    );
  }

  const siteUrl = `http://localhost:3000/${data.slug}`;

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 text-foreground">Hola, {data.name} 👋</h2>
          <div className="flex items-center gap-3">
             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stats.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {stats.isActive ? 'Restaurante Activo' : 'Restaurante Inactivo'}
             </span>
             <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest">
                {stats.subscription.planName} {stats.subscription.isTrial ? '(Prueba)' : ''}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={siteUrl}
            target="_blank"
            className="flex items-center gap-2 px-6 py-3.5 bg-foreground text-background rounded-2xl text-sm font-bold hover:scale-105 transition-all shadow-xl active:scale-95"
          >
            <Eye size={18} />
            Ver Sitio Público
          </Link>
          <Link 
            href="/admin/dashboard/settings"
            className="p-3.5 glass dark:glass-dark text-foreground rounded-2xl hover:bg-primary/10 hover:text-primary transition-all border border-border"
          >
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {/* URL Quick Copy */}
      <div className="glass dark:glass-dark rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-border/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Copy size={20} />
          </div>
          <div>
            <p className="text-xs text-foreground/50 font-semibold uppercase tracking-wider mb-1">Enlace Público Digital</p>
            <p className="text-sm font-medium text-foreground/90">{siteUrl}</p>
          </div>
        </div>
        <button 
          onClick={() => navigator.clipboard.writeText(siteUrl)}
          className="px-5 py-2 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-bold transition-colors border border-border/50 text-foreground"
        >
          Copiar Link
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Platillos Creados" value={stats.menuCount.toString()} icon={<TrendingUp size={24} />} trend="Menú" link="/admin/dashboard/menu" />
        <StatCard title="Reservas Hoy" value={stats.reservationsToday.toString()} icon={<Users size={24} />} trend="Agenda" link="/admin/dashboard/reservations" />
        <StatCard title="Órdenes Hoy" value={stats.ordersToday.toString()} icon={<TrendingUp size={24} />} trend="Órdenes" link="/admin/dashboard/orders" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass dark:glass-dark rounded-3xl p-8 border border-border/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <h3 className="text-xl font-extrabold mb-6 tracking-tight">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/dashboard/menu/add" className="p-4 bg-foreground/5 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                <p className="font-bold text-sm">Crear Platillo</p>
              </Link>
              <Link href="/admin/dashboard/menu" className="p-4 bg-foreground/5 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                <p className="font-bold text-sm">Gestionar Menú</p>
              </Link>
              <Link href="/admin/dashboard/reservations" className="p-4 bg-foreground/5 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                <p className="font-bold text-sm">Ver Agenda</p>
              </Link>
              <Link href="/admin/dashboard/settings" className="p-4 bg-foreground/5 rounded-2xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-center">
                <p className="font-bold text-sm">Editar Perfil</p>
              </Link>
            </div>
          </div>

          <div className="glass dark:glass-dark rounded-3xl p-8 border border-border/30 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-extrabold mb-2 tracking-tight">Suscripción: {stats.subscription.planName}</h3>
              <p className="text-foreground/50 text-sm">Tu cuenta está en estado <span className="font-bold text-primary">{stats.subscription.status}</span>.</p>
              {stats.subscription.endDate && (
                <p className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mt-4">Próximo vencimiento: {new Date(stats.subscription.endDate).toLocaleDateString()}</p>
              )}
            </div>
            <Link href="/admin/dashboard/billing" className="mt-8 px-6 py-4 bg-primary text-white text-center rounded-2xl font-black tracking-tight hover:scale-105 transition-all shadow-xl shadow-primary/20">
              Gestionar Plan
            </Link>
          </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, link }: { title: string, value: string, icon: React.ReactNode, trend: string, link: string }) {
  return (
    <Link href={link} className="glass dark:glass-dark p-6 rounded-3xl shadow-lg border border-border/30 hover:border-primary/40 hover:shadow-primary/10 transition-all duration-300 group cursor-pointer relative overflow-hidden">
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3.5 bg-background shadow-sm border border-border/50 text-primary rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
          {trend}
        </span>
      </div>
      <div className="relative z-10">
        <h4 className="text-foreground/60 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</h4>
        <p className="text-4xl font-black tracking-tight">{value}</p>
      </div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    </Link>
  );
}
