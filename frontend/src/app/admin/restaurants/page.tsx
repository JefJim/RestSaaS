"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/context/TenantContext";
import { Button } from "@/components/ui/Button";
import { Store, Trash2, GitPullRequest, ArrowLeft, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManageRestaurantsPage() {
  const { restaurants, refreshRestaurants } = useTenant();
  const [loading, setLoading] = useState(false);
  const [isConverting, setIsConverting] = useState<string | null>(null);
  const [targetRestId, setTargetRestId] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este restaurante? Esta acción lo desactivará.")) return;
    
    setLoading(true);
    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

    try {
      const res = await fetch(`${apiUrl}/api/restaurants/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setStatus({ type: 'success', message: "Restaurante eliminado correctamente." });
        await refreshRestaurants();
      } else {
        setStatus({ type: 'error', message: "Error al eliminar el restaurante." });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Error de conexión." });
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async (sourceId: string) => {
    if (!targetRestId) return;
    setLoading(true);
    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

    try {
      const res = await fetch(`${apiUrl}/api/restaurants/${sourceId}/convert-to-branch`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ targetRestaurantId: targetRestId })
      });

      if (res.ok) {
        setStatus({ type: 'success', message: "¡Conversión exitosa! El restaurante ahora es una sucursal." });
        setIsConverting(null);
        setTargetRestId("");
        await refreshRestaurants();
      } else {
        const msg = await res.text();
        setStatus({ type: 'error', message: msg || "Error durante la conversión." });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Error de conexión." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Panel de Control</span>
        </Link>

        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Mis Restaurantes</h1>
            <p className="text-foreground/60">Gestiona la estructura de tus negocios</p>
          </div>
          <Button onClick={() => router.push("/admin/restaurants/new")} className="rounded-xl h-12 px-6 font-bold">
            Nuevo Restaurante
          </Button>
        </div>

        {status && (
          <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
            <p className="font-bold text-sm">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          {restaurants.map((rest) => (
            <div key={rest.restaurantId} className="glass dark:glass-dark rounded-3xl p-6 border border-border/50 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Store size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{rest.name}</h3>
                    <p className="text-sm text-foreground/40">{rest.slug}.tablehive.com • {rest.branchCount} Sucursales</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsConverting(isConverting === rest.restaurantId ? null : rest.restaurantId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-all text-xs font-bold border border-orange-500/10"
                  >
                    <GitPullRequest size={14} />
                    Convertir en Sucursal
                  </button>
                  <button 
                    onClick={() => handleDelete(rest.restaurantId)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all text-xs font-bold border border-red-500/10"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>

              {isConverting === rest.restaurantId && (
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 animate-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-3 mb-6 text-orange-500">
                    <AlertTriangle size={20} className="shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-sm">Transferencia de Datos</p>
                      <p className="text-xs opacity-70">El menú, reservaciones y órdenes de <b>{rest.name}</b> se moverán a una nueva sucursal dentro del restaurante seleccionado. Este restaurante independiente será desactivado.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <select 
                      value={targetRestId}
                      onChange={(e) => setTargetRestId(e.target.value)}
                      className="flex-1 h-12 bg-background border border-border rounded-xl px-4 focus:ring-2 focus:ring-primary/20 outline-none font-semibold text-sm"
                    >
                      <option value="">Selecciona el restaurante destino...</option>
                      {restaurants.filter(r => r.restaurantId !== rest.restaurantId).map(r => (
                        <option key={r.restaurantId} value={r.restaurantId}>{r.name}</option>
                      ))}
                    </select>
                    <Button 
                      disabled={!targetRestId || loading} 
                      onClick={() => handleConvert(rest.restaurantId)}
                      variant="primary"
                      className="h-12 px-8 rounded-xl font-bold"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : "Confirmar Conversión"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {restaurants.length === 0 && (
            <div className="py-20 text-center glass rounded-3xl border border-dashed border-border flex flex-col items-center">
              <Store size={48} className="text-foreground/20 mb-4" />
              <p className="text-foreground/40 font-bold">No tienes restaurantes registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
