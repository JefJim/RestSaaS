"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface Branch {
  id: string;
  name: string;
  address: string;
}

function BranchSelectorContent() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");

  const handleLogout = () => {
    localStorage.removeItem("restsaas_token");
    localStorage.removeItem("restsaas_selected_restaurant_id");
    localStorage.removeItem("restsaas_selected_restaurant_name");
    localStorage.removeItem("restsaas_selected_branch_id");
    localStorage.removeItem("restsaas_selected_branch_name");
    router.push("/login");
  };

  useEffect(() => {
    if (!restaurantId) {
      router.push("/select-restaurant");
      return;
    }

    const fetchBranches = async () => {
      const token = localStorage.getItem("restsaas_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      try {
        const res = await fetch(`${apiUrl}/api/auth/restaurants/${restaurantId}/branches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBranches(data);
          
          // Auto-select if only one branch
          if (data.length === 1) {
            handleSelect(data[0]);
          }
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [restaurantId, router]);

  const handleSelect = async (branch: Branch) => {
    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    
    try {
      const res = await fetch(`${apiUrl}/api/auth/select-context`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ restaurantId, branchId: branch.id })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("restsaas_token", data.token); // Save new token with claims
        localStorage.setItem("restsaas_selected_branch_id", branch.id);
        localStorage.setItem("restsaas_selected_branch_name", branch.name);
        window.location.href = "/admin/dashboard";
      }
    } catch (error) {
      console.error("Error selecting context:", error);
    }
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
        
        <h1 className="text-3xl font-bold mb-2">Selecciona una Sucursal</h1>
        <p className="text-foreground/60 mb-10 text-center">
          ¿En qué sede quieres trabajar hoy?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => handleSelect(b)}
              className="p-6 rounded-2xl glass dark:glass-dark hover:border-primary/50 border border-border/50 transition-all text-left flex flex-col gap-2 group"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl group-hover:text-primary transition-colors">{b.name}</span>
              </div>
              <span className="text-sm text-foreground/40">{b.address || "Sin dirección registrada"}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4 mt-8 w-full max-w-xs">
          <Button 
            variant="outline" 
            onClick={() => router.push("/select-restaurant")}
          >
            &larr; Volver a restaurantes
          </Button>

          <Button 
            variant="ghost" 
            className="text-foreground/40 hover:text-foreground"
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function SelectBranchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BranchSelectorContent />
    </Suspense>
  );
}
