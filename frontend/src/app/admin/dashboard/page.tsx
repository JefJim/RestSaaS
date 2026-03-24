"use client";

import { useEffect, useState } from "react";
import { Copy, ExternalLink, TrendingUp, Users, Eye } from "lucide-react";
import Link from "next/link";

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRestaurant = async () => {
      const token = localStorage.getItem("restsaas_token");
      try {
        const res = await fetch("http://localhost:8080/api/restaurants/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Acceso denegado o sesión expirada.");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurant();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 glass dark:glass-dark rounded-3xl border border-red-500/20 bg-red-500/5 text-red-500">
        <h3 className="font-bold text-lg mb-2">Error de conexión</h3>
        <p>{error || "No se pudo cargar la información del restaurante."}</p>
      </div>
    );
  }

  const siteUrl = `http://localhost:3000/${data.slug}`;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Hola, {data.name} 👋</h2>
          <p className="text-foreground/60 text-lg">Aquí está el resumen de tu restaurante el día de hoy.</p>
        </div>
        <Link 
          href={siteUrl}
          target="_blank"
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 active:scale-95"
        >
          <ExternalLink size={18} />
          Visitar Website
        </Link>
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
        <StatCard title="Visitas web hoy" value="124" icon={<Eye size={24} />} trend="+12%" />
        <StatCard title="Reservaciones" value="8" icon={<Users size={24} />} trend="+2" />
        <StatCard title="Ganancias (Estimadas)" value="₡45,000" icon={<TrendingUp size={24} />} trend="+5%" />
      </div>

      {/* Upcoming generic view */}
      <div className="glass dark:glass-dark rounded-3xl p-6 md:p-8 shadow-xl border border-border/30 h-[300px] flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent blur-3xl -z-10"></div>
        <h3 className="text-xl font-extrabold mb-4 tracking-tight">Actividad Reciente</h3>
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/30 rounded-2xl bg-foreground/5 shadow-inner">
          <div className="p-4 bg-background rounded-full mb-3 shadow-sm border border-border/50 text-primary">
            <TrendingUp size={24} />
          </div>
          <p className="text-foreground/50 font-medium text-sm">
            Tus métricas en tiempo real aparecerán aquí pronto.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="glass dark:glass-dark p-6 rounded-3xl shadow-lg border border-border/30 hover:border-primary/40 hover:shadow-primary/10 transition-all duration-300 group cursor-default relative overflow-hidden">
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
    </div>
  );
}
