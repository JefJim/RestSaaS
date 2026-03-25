"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Store, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewRestaurantPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

    try {
      const res = await fetch(`${apiUrl}/api/restaurants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, slug })
      });

      if (res.ok) {
        // Success! Redirect to select-restaurant to see the new one
        router.push("/select-restaurant");
      } else {
        const errorData = await res.text();
        setError(errorData || "Error al crear el restaurante.");
      }
    } catch (err) {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^\w ]+/g, '').replace(/ +/g, '-'));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 md:p-12">
      <div className="w-full max-w-lg">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors mb-12 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Volver al Panel</span>
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Store size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Restaurante</h1>
            <p className="text-foreground/60">Registra un nuevo negocio en tu plataforma</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-6 glass dark:glass-dark p-8 rounded-3xl border border-border/50">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">Nombre del Restaurante</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => generateSlug(e.target.value)}
              className="w-full h-14 bg-background/50 border border-border/50 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
              placeholder="Ej: Pizza Luna Centro"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground/40 px-1">Slug (URL del negocio)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full h-14 bg-background/50 border border-border/50 rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-primary"
                placeholder="pizzaluna-centro"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-bold text-foreground/20 italic">.tablehive.com</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-bold bg-red-500/5 p-4 rounded-xl border border-red-500/10 italic">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
            {loading ? <Loader2 className="animate-spin" /> : "Crear Restaurante"}
          </Button>
        </form>
      </div>
    </div>
  );
}
