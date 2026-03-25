"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Restaurant {
  restaurantId: string;
  name: string;
  slug: string;
  role: string;
  logoUrl?: string;
  branchCount: number;
  defaultBranchId: string | null;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface TenantContextType {
  activeRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  setActiveRestaurant: (restaurant: Restaurant) => Promise<void>;
  activeBranch: Branch | null;
  branches: Branch[];
  setActiveBranch: (branch: Branch) => void;
  loading: boolean;
  plan: string;
  refreshRestaurants: () => Promise<void>;
  refreshBranches: (restaurantId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeRestaurant, setActiveRestaurantState] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("");

  const refreshPlan = async (isRetry = false) => {
    try {
      const token = localStorage.getItem("restsaas_token");
      if (!token) { setPlan(""); return; }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/subscriptions/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan?.name || "Core / Basic");
      } else {
        // Fallback to token if subscription endpoint fails (e.g. no subscription created yet)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setPlan(payload["Plan"] || "Core / Basic");
      }
    } catch {
      setPlan("Core / Basic");
    }
  };

  const refreshRestaurants = async () => {
    const token = localStorage.getItem("restsaas_token");
    if (!token) { setLoading(false); return; }
    
    await refreshPlan();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/auth/my-restaurants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);

        const savedId = localStorage.getItem("restsaas_selected_restaurant_id");
        if (savedId) {
          const saved = data.find((r: Restaurant) => r.restaurantId === savedId);
          if (saved) setActiveRestaurantState(saved);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBranches = async (restaurantId: string) => {
    const token = localStorage.getItem("restsaas_token");
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/auth/restaurants/${restaurantId}/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setBranches(data);

        const savedBranchId = localStorage.getItem("restsaas_selected_branch_id");
        if (savedBranchId) {
          const saved = data.find((b: Branch) => b.id === savedBranchId);
          if (saved) setActiveBranchState(saved);
        }
      }
    } catch (error) {
      console.error("Error fetching branches", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshRestaurants();
      const savedRestId = localStorage.getItem("restsaas_selected_restaurant_id");
      if (savedRestId) await refreshBranches(savedRestId);
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveRestaurant = async (restaurant: Restaurant) => {
    setActiveRestaurantState(restaurant);
    localStorage.setItem("restsaas_selected_restaurant_id", restaurant.restaurantId);
    localStorage.setItem("restsaas_selected_restaurant_name", restaurant.name);

    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

    if (restaurant.branchCount > 1) {
      window.location.href = `/select-branch?restaurantId=${restaurant.restaurantId}`;
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/auth/select-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: restaurant.restaurantId, branchId: restaurant.defaultBranchId || null })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("restsaas_token", data.token);
        await refreshPlan();
        if (restaurant.defaultBranchId) {          localStorage.setItem("restsaas_selected_branch_id", restaurant.defaultBranchId);
          localStorage.setItem("restsaas_selected_branch_name", "Principal");
        } else {
          localStorage.removeItem("restsaas_selected_branch_id");
          localStorage.removeItem("restsaas_selected_branch_name");
        }
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = `/select-branch?restaurantId=${restaurant.restaurantId}`;
      }
    } catch (error) {
      console.error("Error auto-selecting branch context", error);
      window.location.href = `/select-branch?restaurantId=${restaurant.restaurantId}`;
    }
  };

  const setActiveBranch = async (branch: Branch) => {
    if (!activeRestaurant) return;
    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

    try {
      const res = await fetch(`${apiUrl}/api/auth/select-context`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ restaurantId: activeRestaurant.restaurantId, branchId: branch.id })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("restsaas_token", data.token);
        localStorage.setItem("restsaas_selected_branch_id", branch.id);
        localStorage.setItem("restsaas_selected_branch_name", branch.name);
        setActiveBranchState(branch);
        await refreshPlan();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error selecting branch context", error);
    }
  };

  return (
    <TenantContext.Provider value={{
      activeRestaurant,
      restaurants,
      setActiveRestaurant,
      activeBranch,
      branches,
      setActiveBranch,
      loading,
      plan,
      refreshRestaurants,
      refreshBranches
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) throw new Error('useTenant must be used within a TenantProvider');
  return context;
}
