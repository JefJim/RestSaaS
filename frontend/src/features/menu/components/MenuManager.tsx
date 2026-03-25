"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Edit3, Save, X, GripVertical, Loader2, ChevronRight,
  FolderPlus, Image as ImageIcon, Lock
} from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useTenant } from "@/context/TenantContext";

interface MenuItem {
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
  items: MenuItem[];
}

export const MenuManager = () => {
  const { plan } = useTenant();
  const allowImages = plan.toLowerCase().includes("pro") || plan.toLowerCase().includes("premium");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Category creation
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  // Item editing
  const [editingItem, setEditingItem] = useState<{ item: MenuItem; categoryId: string } | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', basePrice: 0, imageUrl: '', isAvailable: true });

  // New item creation
  const [addingItemToCat, setAddingItemToCat] = useState<string | null>(null);
  const [newItemForm, setNewItemForm] = useState({ name: '', description: '', basePrice: 0, imageUrl: '' });
  const [isUploadingNew, setIsUploadingNew] = useState(false);

  const handleUploadNewItemImage = async (file: File) => {
    if (!file) return;
    setIsUploadingNew(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setNewItemForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } catch (e) { console.error(e); }
    finally { setIsUploadingNew(false); }
  };

  const token = () => localStorage.getItem("restsaas_token") || "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/menus`, { headers: { Authorization: `Bearer ${token()}` } });
      const menus = await res.json();
      if (menus.length > 0) {
        const menuId = menus[0].id;
        setActiveMenuId(menuId);
        const fullRes = await fetch(`${apiUrl}/api/menus/${menuId}/full`, { headers: { Authorization: `Bearer ${token()}` } });
        const fullMenu = await fullRes.json();
        setCategories(fullMenu.categories || []);
      }
    } catch (err) { console.error("Error fetching menu:", err); }
    finally { setLoading(false); }
  }, [apiUrl]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ---- Category creation ----
  const handleCreateCategory = async () => {
    if (!activeMenuId || !newCatName.trim()) return;
    setSavingCat(true);
    try {
      const res = await fetch(`${apiUrl}/api/menus/categories`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ menuId: activeMenuId, name: newCatName.trim(), displayOrder: categories.length })
      });
      if (res.ok) {
        const cat = await res.json();
        setCategories(prev => [...prev, { ...cat, items: [] }]);
        setNewCatName(""); setShowNewCat(false);
      }
    } catch (e) { console.error(e); }
    finally { setSavingCat(false); }
  };

  // ---- Delete category ----
  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("¿Eliminar esta categoría y todos sus platillos?")) return;
    // API call would go here — for now remove locally and add an endpoint later
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // ---- Edit item ----
  const handleEditItem = (item: MenuItem, categoryId: string) => {
    setEditingItem({ item, categoryId });
    setEditForm({ name: item.name, description: item.description, basePrice: item.basePrice, imageUrl: item.imageUrl || '', isAvailable: item.isAvailable });
  };

  const handleSaveItem = async () => {
    if (!editingItem || !activeMenuId) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/menus/${activeMenuId}/items/${editingItem.item.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, description: editForm.description, basePrice: editForm.basePrice, imageUrl: editForm.imageUrl })
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories(prev => prev.map(c => c.id === editingItem.categoryId
          ? { ...c, items: c.items.map(i => i.id === editingItem.item.id ? { ...updated } : i) }
          : c));
        setEditingItem(null);
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  // ---- Delete item ----
  const handleDeleteItem = async (catId: string, itemId: string) => {
    if (!confirm("¿Eliminar este platillo?")) return;
    try {
      await fetch(`${apiUrl}/api/menus/items/${itemId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token()}` }
      });
      setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
    } catch (e) { console.error(e); }
  };

  // ---- Add new item ----
  const handleAddItem = async (catId: string) => {
    if (!newItemForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/menus/items`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: catId, name: newItemForm.name.trim(), description: newItemForm.description, basePrice: newItemForm.basePrice, imageUrl: newItemForm.imageUrl || null })
      });
      if (res.ok) {
        const newItem = await res.json();
        setCategories(prev => prev.map(c => c.id === catId ? { ...c, items: [...c.items, newItem] } : c));
        setAddingItemToCat(null);
        setNewItemForm({ name: '', description: '', basePrice: 0, imageUrl: '' });
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32 text-foreground/40">
      <Loader2 size={24} className="animate-spin mr-2" /> Cargando menú...
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Menú Digital</h2>
          <p className="text-sm text-foreground/50 mt-0.5">Este menú es compartido por todas las sucursales. Ajustes por sucursal en <strong>Sucursales → Configurar Menú</strong>.</p>
        </div>
        <button
          onClick={() => setShowNewCat(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <FolderPlus size={16} /> Nueva Categoría
        </button>
      </div>

      {/* New Category Form */}
      {showNewCat && (
        <div className="bg-surface border border-primary/20 rounded-2xl p-4 flex items-center gap-3 shadow-lg shadow-primary/5 animate-in slide-in-from-top-2 duration-150">
          <input
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateCategory()}
            placeholder="Nombre de la categoría (ej: Entradas, Bebidas, Postres)"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          <button onClick={handleCreateCategory} disabled={savingCat || !newCatName.trim()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors">
            {savingCat ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Crear
          </button>
          <button onClick={() => { setShowNewCat(false); setNewCatName(""); }}
            className="p-2.5 rounded-xl hover:bg-foreground/5 text-foreground/40"><X size={16} /></button>
        </div>
      )}

      {/* Categories */}
      {categories.length === 0 ? (
        <div className="text-center p-16 bg-surface border-2 border-dashed border-border/30 rounded-3xl">
          <FolderPlus size={36} className="mx-auto mb-3 text-foreground/20" />
          <p className="font-bold text-foreground/50">No hay categorías aún</p>
          <p className="text-sm text-foreground/30 mt-1">Crea una categoría para empezar a agregar platillos.</p>
          <button onClick={() => setShowNewCat(true)} className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
            <FolderPlus size={14} /> Crear Primera Categoría
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
              {/* Category Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <GripVertical className="text-foreground/20 cursor-grab" size={18} />
                  <h3 className="font-black text-base">{cat.name}</h3>
                  <span className="text-xs text-foreground/40 font-medium">{cat.items.length} platillos</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 rounded-xl text-foreground/30 hover:text-red-500 hover:bg-red-500/5 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Items grid */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {cat.items.map((item) => (
                  <div key={item.id} className="p-3 bg-foreground/5 rounded-xl border border-border/20 group hover:border-primary/20 transition-all flex gap-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-sm truncate">{item.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button onClick={() => handleEditItem(item, cat.id)} className="p-1.5 rounded-lg text-foreground/40 hover:text-primary hover:bg-primary/5">
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => handleDeleteItem(cat.id, item.id)} className="p-1.5 rounded-lg text-foreground/40 hover:text-red-500 hover:bg-red-500/5">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/40 line-clamp-1 mt-0.5">{item.description}</p>
                      <p className="text-primary font-black text-sm mt-1">₡{item.basePrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                {/* Add item form or button */}
                {addingItemToCat === cat.id ? (
                  <div className="border-2 border-primary/20 rounded-xl p-3 space-y-3 col-span-full">
                    <div className="grid grid-cols-2 gap-3">
                      <input value={newItemForm.name} onChange={e => setNewItemForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Nombre *" className="col-span-2 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      <input value={newItemForm.description} onChange={e => setNewItemForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Descripción" className="col-span-2 bg-background border border-border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-sm text-foreground/40">₡</span>
                        <input type="number" value={newItemForm.basePrice} onChange={e => setNewItemForm(f => ({ ...f, basePrice: parseFloat(e.target.value) || 0 }))}
                          placeholder="0" className="w-full bg-background border border-border rounded-xl pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      {allowImages ? (
                        <div className="bg-background border border-border rounded-xl px-3 py-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             {newItemForm.imageUrl ? (
                               <div className="relative group">
                                 <img src={newItemForm.imageUrl} className="w-8 h-8 rounded-lg object-cover" />
                                 <button onClick={() => setNewItemForm(f => ({...f, imageUrl: ''}))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <X size={8} />
                                 </button>
                               </div>
                             ) : (
                               <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/20">
                                 <ImageIcon size={14} />
                               </div>
                             )}
                             <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{newItemForm.imageUrl ? 'Imagen Lista' : 'Sin Imagen'}</span>
                          </div>
                          
                          <label className="cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleUploadNewItemImage(e.target.files[0])} disabled={isUploadingNew} />
                            <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-1.5">
                              {isUploadingNew ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />} 
                              {newItemForm.imageUrl ? 'Cambiar' : 'Subir'}
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-amber-600 font-bold uppercase tracking-wider leading-tight">
                          <Lock size={12} /> Mejora tu plan actual para agregar imágenes para este platillo
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAddItem(cat.id)} disabled={saving || !newItemForm.name.trim()}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs disabled:opacity-50 hover:bg-primary/90">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Agregar Platillo
                      </button>
                      <button onClick={() => { setAddingItemToCat(null); setNewItemForm({ name: '', description: '', basePrice: 0, imageUrl: '' }); }}
                        className="px-4 py-2 rounded-xl font-bold text-xs border border-border hover:bg-foreground/5"><X size={12} /></button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setAddingItemToCat(cat.id); setNewItemForm({ name: '', description: '', basePrice: 0, imageUrl: '' }); }}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border/30 rounded-xl text-foreground/30 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-sm font-semibold">
                    <Plus size={16} /> Agregar Platillo
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-black">Editar Platillo</h3>
              <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {allowImages && (
                <div>
                  <label className="block text-xs font-bold text-foreground/50 mb-2 uppercase tracking-wider">Imagen</label>
                  <div className="flex items-center gap-3">
                    {editForm.imageUrl && <img src={editForm.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />}
                    <ImageUpload value={editForm.imageUrl} onChange={(url) => setEditForm(p => ({ ...p, imageUrl: url || '' }))} />
                  </div>
                </div>
              )}
               {!allowImages && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-[10px] text-amber-600 font-bold uppercase tracking-widest leading-tight">
                  <Lock size={14} className="flex-shrink-0" />
                  <span>Mejora tu plan actual para agregar imágenes para este platillo</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">Nombre</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">Descripción</label>
                <input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">Precio Base (₡)</label>
                <input type="number" value={editForm.basePrice} onChange={e => setEditForm(p => ({ ...p, basePrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveItem} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary/90">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                </button>
                <button onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-border hover:bg-foreground/5">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
