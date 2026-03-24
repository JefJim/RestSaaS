"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export const MenuManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      const token = localStorage.getItem("restsaas_token");
      try {
        // 1. Get the first menu
        const res = await fetch("http://localhost:8080/api/menus", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const menus = await res.json();
        if (menus.length > 0) {
          const menuId = menus[0].id;
          setActiveMenuId(menuId);
          // 2. Get full menu details
          const fullRes = await fetch(`http://localhost:8080/api/menus/${menuId}/full`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const fullMenu = await fullRes.json();
          setCategories(fullMenu.categories || []);
        }
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  if (loading) return <div>Cargando menú...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">Gestión de Menú</h2>
        <Button className="rounded-full shadow-lg">
          <Plus size={18} className="mr-2" /> Nueva Categoría
        </Button>
      </div>

      <div className="space-y-6">
        {categories.length === 0 && (
          <div className="text-center p-12 glass dark:glass-dark rounded-3xl border-2 border-dashed border-border/30">
            <p className="text-foreground/50">No hay categorías en tu menú aún.</p>
          </div>
        )}

        {categories.map((cat) => (
          <div key={cat.id} className="glass dark:glass-dark rounded-3xl p-6 shadow-sm border border-border/40 space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-4">
              <div className="flex items-center gap-3">
                <GripVertical className="text-foreground/20 cursor-grab" size={20} />
                <h3 className="text-lg font-bold">{cat.name}</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-foreground/40 hover:text-primary transition-colors"><Edit3 size={18} /></button>
                <button className="p-2 text-foreground/40 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-foreground/5 rounded-2xl border border-border/20 group hover:border-primary/30 transition-all">
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-foreground/50 line-clamp-1">{item.description}</p>
                    <p className="text-primary font-black mt-1 text-sm">₡{item.price.toLocaleString()}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-2 text-foreground/40 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center p-4 border-2 border-dashed border-border/20 rounded-2xl text-foreground/30 hover:text-primary hover:border-primary/30 transition-all hover:bg-primary/5">
                <Plus size={20} className="mr-2" /> Agregar Item
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
