"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface Restaurant {
  restaurantId: string;
  name: string;
  slug: string;
  role: string;
  branchCount: number;
  defaultBranchId: string | null;
}

export default function SelectRestaurantPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSelecting, setAutoSelecting] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("restsaas_token");
    localStorage.removeItem("restsaas_selected_restaurant_id");
    localStorage.removeItem("restsaas_selected_restaurant_name");
    localStorage.removeItem("restsaas_selected_branch_id");
    localStorage.removeItem("restsaas_selected_branch_name");
    router.push("/login");
  };

  useEffect(() => {
    const fetchRestaurants = async () => {
      const token = localStorage.getItem("restsaas_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      try {
        const res = await fetch(`${apiUrl}/api/auth/my-restaurants`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setRestaurants(data);
          
          // Auto-selection removed as per user request
          /*
          if (data && data.length === 1) {
            console.log("Auto-selecting lone restaurant in 1.5s...");
            setAutoSelecting(true);
            const timer = setTimeout(() => {
              handleSelect(data[0]);
            }, 1500);
            return () => clearTimeout(timer);
          }
          */
          console.log("Found restaurants:", data.length, data);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [router]);

  const handleSelect = async (restaurant: Restaurant) => {
    localStorage.setItem("restsaas_selected_restaurant_id", restaurant.restaurantId);
    localStorage.setItem("restsaas_selected_restaurant_name", restaurant.name);

    // Optimization: If the restaurant has 0 or 1 branch, select it automatically and skip the branch selector page
    if (restaurant.branchCount <= 1) {
      console.log("Single or no branch detected, auto-selecting context...");
      const token = localStorage.getItem("restsaas_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      
      try {
        const res = await fetch(`${apiUrl}/api/auth/select-context`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ 
            restaurantId: restaurant.restaurantId, 
            branchId: restaurant.defaultBranchId || null
          })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("restsaas_token", data.token);
          if (restaurant.defaultBranchId) {
            localStorage.setItem("restsaas_selected_branch_id", restaurant.defaultBranchId);
            localStorage.setItem("restsaas_selected_branch_name", "Principal"); 
          } else {
            localStorage.removeItem("restsaas_selected_branch_id");
            localStorage.removeItem("restsaas_selected_branch_name");
          }
          window.location.href = "/admin/dashboard";
          return;
        }
      } catch (error) {
        console.error("Error auto-selecting branch:", error);
      }
    }

    // Default: go to branch selection
    router.push(`/select-branch?restaurantId=${restaurant.restaurantId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="z-10 w-full max-w-2xl flex flex-col items-center">
        <Image src="/logo.png" alt="TableHive" width={120} height={120} className="mb-8" />
        
        <h1 className="text-3xl font-bold mb-2">
          {restaurants.length > 0 ? "Selecciona un Restaurante" : "¡Bienvenido a TableHive!"}
        </h1>
        <p className="text-foreground/60 mb-10 text-center">
          {restaurants.length > 0 
            ? "Parece que tienes acceso a múltiples negocios. ¿En cuál quieres trabajar hoy?"
            : "Comencemos configurando tu primer negocio para que puedas empezar a vender."}
        </p>

        {/* autoSelecting indicator removed */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {restaurants.map((r) => (
            <button
              key={r.restaurantId}
              onClick={() => handleSelect(r)}
              className="p-6 rounded-2xl glass dark:glass-dark hover:border-primary/50 border border-border/50 transition-all text-left flex flex-col gap-2 group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl group-hover:text-primary transition-colors">{r.name}</span>
                <span className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">
                  {r.role === "Owner" ? "Dueño" : r.role === "Admin" ? "Administrador" : "Staff"}
                </span>
              </div>
              <span className="text-sm text-foreground/40">{r.slug}.tablehive.com</span>
            </button>
          ))}
        </div>

        {restaurants.length === 0 && (
          <div className="text-center flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <span className="text-4xl">🚀</span>
            </div>
            <p className="text-xl font-semibold">Aún no tienes restaurantes.</p>
            <Button size="lg" onClick={() => router.push("/onboarding")} className="px-10 h-14 text-lg">
              Empezar - Crear mi restaurante
            </Button>
          </div>
        )}

        <Button 
          variant="ghost" 
          className="mt-12 text-foreground/40 hover:text-foreground"
          onClick={handleLogout}
        >
          Cerrar sesión e ingresar con otra cuenta
        </Button>
      </div>
    </main>
  );
}
