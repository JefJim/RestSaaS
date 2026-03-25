"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ToggleLeft, ToggleRight, Edit3, Save, X, Loader2, ChevronDown, ChevronUp
} from "lucide-react";

interface MenuItemGlobal {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  displayOrder: number;
  items: MenuItemGlobal[];
}

interface Override {
  menuItemId: string;
  priceOverride?: number;
  isAvailableOverride?: boolean;
}

interface BranchInfo {
  id: string;
  name: string;
  address?: string;
  isMain: boolean;
}

export default function BranchMenuOverridePage() {
  const params = useParams();
  const router = useRouter();
  const branchId = params.branchId as string;

  const [branch, setBranch] = useState<BranchInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItemGlobal | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const token = () => localStorage.getItem("restsaas_token") || "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

  const getOverride = (itemId: string) => overrides.find(o => o.menuItemId === itemId);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Get restaurant id from token
      const tok = token();
      const payload = JSON.parse(atob(tok.split('.')[1]));
      const restaurantId = payload["RestaurantId"];

      // Get branch info
      const brRes = await fetch(`${apiUrl}/api/restaurants/${restaurantId}/branches`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (brRes.ok) {
        const allBranches: BranchInfo[] = await brRes.json();
        const found = allBranches.find(b => b.id === branchId);
        setBranch(found || null);
      }

      // Get menu
      const menusRes = await fetch(`${apiUrl}/api/menus`, { headers: { Authorization: `Bearer ${tok}` } });
      const menus = await menusRes.json();
      if (menus.length > 0) {
        const menuId = menus[0].id;
        const fullRes = await fetch(`${apiUrl}/api/menus/${menuId}/full`, { headers: { Authorization: `Bearer ${tok}` } });
        const fullMenu = await fullRes.json();
        const cats: Category[] = fullMenu.categories || [];
        setCategories(cats);
        setExpandedCats(new Set(cats.map((c: Category) => c.id)));
      }

      // Get overrides for this branch
      const ovrRes = await fetch(`${apiUrl}/api/branches/${branchId}/overrides`, {
        headers: { Authorization: `Bearer ${tok}` }
      });
      if (ovrRes.ok) setOverrides(await ovrRes.json());

    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [branchId, apiUrl]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleAvailability = async (item: MenuItemGlobal) => {
    const current = getOverride(item.id);
    const newAvail = !(current?.isAvailableOverride ?? item.isAvailable);
    setSaving(item.id);
    try {
      const res = await fetch(`${apiUrl}/api/branches/${branchId}/overrides`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: item.id,
          priceOverride: current?.priceOverride ?? null,
          isAvailableOverride: newAvail
        })
      });
      if (res.ok) {
        setOverrides(prev => {
          const existing = prev.find(o => o.menuItemId === item.id);
          if (existing) return prev.map(o => o.menuItemId === item.id ? { ...o, isAvailableOverride: newAvail } : o);
          return [...prev, { menuItemId: item.id, isAvailableOverride: newAvail }];
        });
      }
    } finally { setSaving(null); }
  };

  const handleSavePrice = async () => {
    if (!editingItem) return;
    setSaving(editingItem.id);
    try {
      const current = getOverride(editingItem.id);
      const res = await fetch(`${apiUrl}/api/branches/${branchId}/overrides`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: editingItem.id,
          priceOverride: editPrice,
          isAvailableOverride: current?.isAvailableOverride ?? null
        })
      });
      if (res.ok) {
        setOverrides(prev => {
          const existing = prev.find(o => o.menuItemId === editingItem.id);
          if (existing) return prev.map(o => o.menuItemId === editingItem.id ? { ...o, priceOverride: editPrice } : o);
          return [...prev, { menuItemId: editingItem.id, priceOverride: editPrice }];
        });
        setEditingItem(null);
      }
    } finally { setSaving(null); }
  };

  const toggleCat = (id: string) => setExpandedCats(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-foreground/40">
      <Loader2 size={24} className="animate-spin mr-2" /> Cargando menú...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 p-6 md:p-8">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/branches"
          className="p-2 rounded-xl border border-border hover:bg-foreground/5 transition-colors mt-1 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Configurar Menú — {branch?.name}</h1>
          <p className="text-sm text-foreground/50 mt-0.5">
            Ajusta precios y disponibilidad para esta sucursal. Los cambios no afectan el menú global.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs font-semibold text-foreground/60">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Precio o disponibilidad cambiada en esta sucursal</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-foreground/20 inline-block" /> Usa el precio/disponibilidad global</span>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCat(cat.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-foreground/5 transition-colors"
            >
              <span className="font-black text-base">{cat.name}</span>
              <div className="flex items-center gap-2 text-foreground/40 text-sm">
                <span>{cat.items.length} platillos</span>
                {expandedCats.has(cat.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Items */}
            {expandedCats.has(cat.id) && (
              <div className="border-t border-border divide-y divide-border/50">
                {cat.items.map(item => {
                  const ovr = getOverride(item.id);
                  const effectivePrice = ovr?.priceOverride ?? item.basePrice;
                  const effectiveAvail = ovr?.isAvailableOverride ?? item.isAvailable;
                  const hasOverride = !!ovr?.priceOverride || ovr?.isAvailableOverride !== undefined;
                  const isEditing = editingItem?.id === item.id;

                  return (
                    <div key={item.id} className={`flex items-center gap-4 px-4 py-3 transition-colors ${hasOverride ? "bg-primary/3" : ""}`}>
                      {/* Image */}
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-foreground/5 flex-shrink-0" />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm truncate">{item.name}</p>
                          {hasOverride && (
                            <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-black uppercase">Override</span>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-foreground/50">₡</span>
                            <input
                              type="number"
                              value={editPrice}
                              onChange={e => setEditPrice(parseFloat(e.target.value) || 0)}
                              className="w-28 bg-background border border-primary/30 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                              autoFocus
                            />
                            <button onClick={handleSavePrice} disabled={saving === item.id}
                              className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90">
                              {saving === item.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            </button>
                            <button onClick={() => setEditingItem(null)} className="p-1.5 rounded-lg hover:bg-foreground/5">
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-primary font-black text-sm">₡{effectivePrice.toLocaleString()}</p>
                            {ovr?.priceOverride && (
                              <span className="text-[11px] text-foreground/30 line-through">₡{item.basePrice.toLocaleString()}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!isEditing && (
                          <button
                            onClick={() => { setEditingItem(item); setEditPrice(effectivePrice); }}
                            className="p-2 rounded-xl border border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                            title="Editar precio"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          disabled={saving === item.id}
                          className={`p-2 rounded-xl border transition-colors ${effectiveAvail ? "border-green-500/30 text-green-500 hover:bg-green-500/5" : "border-red-500/30 text-red-500 hover:bg-red-500/5"}`}
                          title={effectiveAvail ? "Disponible — clic para deshabilitar" : "No disponible — clic para habilitar"}
                        >
                          {saving === item.id ? <Loader2 size={14} className="animate-spin" /> :
                            effectiveAvail ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
