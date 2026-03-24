"use client";

import { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { ChevronDown, Store, Plus, Check } from 'lucide-react';

export default function RestaurantSwitcher() {
  const { activeRestaurant, restaurants, setActiveRestaurant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="absolute top-full left-4 right-4 mt-2 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 space-y-1">
              <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/30">Tus Restaurantes</p>
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => {
                    setActiveRestaurant(restaurant);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    activeRestaurant.id === restaurant.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-foreground/5 text-foreground/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                      <Store size={14} />
                    </div>
                    <span className="text-sm font-bold">{restaurant.name}</span>
                  </div>
                  {activeRestaurant.id === restaurant.id && <Check size={14} />}
                </button>
              ))}
              
              <hr className="my-2 border-border" />
              
              <button
                onClick={() => window.location.href = "/admin/restaurants/new"}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 text-primary transition-colors mb-1"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus size={14} />
                </div>
                <span className="text-sm font-bold">Nuevo Restaurante</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
