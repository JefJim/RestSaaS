"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  role: string;
  logoUrl?: string;
}

interface TenantContextType {
  activeRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  setActiveRestaurant: (restaurant: Restaurant) => void;
  loading: boolean;
  refreshRestaurants: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [activeRestaurant, setActiveRestaurantState] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRestaurants = async () => {
    const token = localStorage.getItem("restsaas_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/restaurants/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);

        // Check for saved active restaurant
        const savedId = localStorage.getItem("active_restaurant_id");
        if (savedId) {
          const saved = data.find((r: Restaurant) => r.id === savedId);
          if (saved) {
            setActiveRestaurantState(saved);
          } else if (data.length > 0) {
            setActiveRestaurantState(data[0]);
          }
        } else if (data.length > 0) {
          setActiveRestaurantState(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRestaurants();
  }, []);

  const setActiveRestaurant = (restaurant: Restaurant) => {
    setActiveRestaurantState(restaurant);
    localStorage.setItem("active_restaurant_id", restaurant.id);
    // Reload page to refresh all tenant-scoped data? 
    // Or just let components re-render if they use this context.
    window.location.reload(); 
  };

  return (
    <TenantContext.Provider value={{ activeRestaurant, restaurants, setActiveRestaurant, loading, refreshRestaurants }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
