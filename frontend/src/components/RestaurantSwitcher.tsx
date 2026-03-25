"use client";

import { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { useRouter } from 'next/navigation';
import { ChevronDown, Store, Plus, Check, Settings } from 'lucide-react';

export default function RestaurantSwitcher() {
  const { activeRestaurant, restaurants, setActiveRestaurant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  if (!activeRestaurant) return null;

  return (
    <div className="relative mb-6 px-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            {activeRestaurant.logoUrl ? (
              <img src={activeRestaurant.logoUrl} alt={activeRestaurant.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store size={20} />
            )}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground line-clamp-1">{activeRestaurant.name}</h4>
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">{activeRestaurant.role}</p>
          </div>
        </div>
        <ChevronDown size={16} className={`text-foreground/30 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <div className="p-2 space-y-1">
              <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">Tus Restaurantes</p>
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.restaurantId}
                  className={`group w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                    activeRestaurant.restaurantId === restaurant.restaurantId 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-foreground/5 text-foreground/60'
                  }`}
                  onClick={() => {
                    setActiveRestaurant(restaurant);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                      <Store size={14} />
                    </div>
                    <span className="text-sm font-bold">{restaurant.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {activeRestaurant.restaurantId === restaurant.restaurantId && <Check size={14} />}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/branches/new?restaurantId=${restaurant.restaurantId}`);
                      }}
                      className="text-[9px] font-black uppercase tracking-tighter text-primary/60 hover:text-primary transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus size={10} />
                      Sucursal
                    </button>
                  </div>
                </div>
              ))}
              
              <hr className="my-2 border-border" />
              
              <button
                onClick={() => router.push("/admin/restaurants/new")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-primary transition-colors mb-1"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <span className="text-sm font-bold">Nuevo Restaurante</span>
              </button>

              <button
                onClick={() => router.push("/admin/restaurants")}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 text-foreground/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Settings size={14} />
                </div>
                <span className="text-sm font-bold">Gestionar Restaurantes</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
