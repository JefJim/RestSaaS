"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import {
  Plus, MapPin, Phone, Table2, Star, Edit2, Trash2, X, Save, Loader2, Image as ImageIcon, Settings
} from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  imageUrl?: string;
  isMain: boolean;
  isActive: boolean;
  tableCount: number;
  createdAt: string;
}

interface BranchForm {
  name: string;
  address: string;
  phone: string;
  tableCount: number;
  imageUrl: string;
}

const emptyForm: BranchForm = { name: "", address: "", phone: "", tableCount: 0, imageUrl: "" };

export default function BranchesPage() {
  const { activeRestaurant, plan } = useTenant();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const getPlanLimits = () => {
    if (plan === "Premium") return { allowImages: true, maxBranches: 9999 };
    if (plan === "Pro Tier") return { allowImages: true, maxBranches: 5 };
    return { allowImages: true, maxBranches: 1 };
  };
  const planInfo = getPlanLimits();

  const token = () => localStorage.getItem("restsaas_token") || "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

  const fetchBranches = useCallback(async () => {
    if (!activeRestaurant?.restaurantId) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/restaurants/${activeRestaurant.restaurantId}/branches`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error("Error al cargar sucursales");
      setBranches(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [activeRestaurant?.restaurantId, apiUrl]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setForm(emptyForm);
    setImgPreview("");
    setShowForm(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name,
      address: branch.address || "",
      phone: branch.phone || "",
      tableCount: branch.tableCount,
      imageUrl: branch.imageUrl || ""
    });
    setImgPreview(branch.imageUrl || "");
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd
      });
      if (res.ok) {
        const { url } = await res.json();
        setForm(f => ({ ...f, imageUrl: url }));
      }
    } catch (e) { console.error("Upload error", e); }
    finally { setUploadingImg(false); }
  };

  const handleSave = async () => {
    if (!activeRestaurant?.restaurantId || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim() || null,
        phone: form.phone.trim() || null,
        tableCount: Number(form.tableCount) || 0,
        imageUrl: form.imageUrl || null
      };
      let res;
      if (editingBranch) {
        res = await fetch(`${apiUrl}/api/restaurants/${activeRestaurant.restaurantId}/branches/${editingBranch.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiUrl}/api/restaurants/${activeRestaurant.restaurantId}/branches`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Error al guardar");
      }
      setShowForm(false);
      await fetchBranches();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`¿Eliminar la sucursal "${branch.name}"? Esta acción no se puede deshacer.`)) return;
    if (!activeRestaurant?.restaurantId) return;
    setDeleting(branch.id);
    try {
      const res = await fetch(`${apiUrl}/api/restaurants/${activeRestaurant.restaurantId}/branches/${branch.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || "Error al eliminar");
      }
      await fetchBranches();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Sucursales</h1>
          <p className="text-sm text-foreground/50 mt-1">
            {branches.length} de {planInfo.maxBranches === 9999 ? "∞" : planInfo.maxBranches} sucursales permitidas
          </p>
        </div>
        {branches.length >= planInfo.maxBranches ? (
          <div className="bg-amber-500/10 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold border border-amber-500/20">
            Mejora tu plan para agregar más sucursales
          </div>
        ) : (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Nueva Sucursal
          </button>
        )}
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-surface border border-primary/20 rounded-2xl p-6 shadow-xl shadow-primary/5 space-y-5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg">{editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/40">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">Nombre *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Downtown, Mall, Principal"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">Dirección</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Ej: Av. Central 123, San José"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="Ej: 22223333"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
            {/* Tables */}
            <div>
              <label className="block text-xs font-bold text-foreground/50 mb-1 uppercase tracking-wider">N° de Mesas</label>
              <input
                type="number"
                value={form.tableCount}
                onChange={e => setForm(f => ({ ...f, tableCount: parseInt(e.target.value) || 0 }))}
                min={0}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
          </div>

          {/* Image Upload — Allowed for all plans */}
          <div className="rounded-xl border border-border p-4 space-y-3">
            <label className="text-xs font-bold text-foreground/50 uppercase tracking-wider">Imagen de Sucursal</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border overflow-hidden bg-foreground/5 flex items-center justify-center flex-shrink-0">
                {imgPreview ? (
                  <img src={imgPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={20} className="text-foreground/20" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImg}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors disabled:opacity-50"
                >
                  {uploadingImg ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />}
                  {uploadingImg ? "Subiendo..." : "Subir Imagen"}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <p className="text-[11px] text-foreground/40 mt-1">JPG, PNG. Máx 5MB</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm border border-border hover:bg-foreground/5 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Branch List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-foreground/40">
          <Loader2 size={24} className="animate-spin mr-2" /> Cargando sucursales...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">{error}</div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 text-foreground/40">
          <p className="text-lg font-bold">Sin sucursales</p>
          <p className="text-sm mt-1">Crea tu primera sucursal para empezar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch, idx) => (
            <div
              key={branch.id}
              className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-primary/20 transition-colors"
            >
              {/* Branch Image */}
              {branch.imageUrl && (
                <div className="w-full md:w-32 h-28 md:h-auto flex-shrink-0 overflow-hidden">
                  <img src={branch.imageUrl} alt={branch.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 space-y-1.5">
                  {/* Branch number + name */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
                      #{idx + 1}
                    </span>
                    <h3 className="font-black text-base">{branch.name}</h3>
                    {branch.isMain && (
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                        <Star size={10} />Principal
                      </span>
                    )}
                  </div>
                  {/* Meta info */}
                  <div className="flex flex-wrap gap-3 text-sm text-foreground/50">
                    {branch.address && (
                      <span className="flex items-center gap-1.5"><MapPin size={12} /> {branch.address}</span>
                    )}
                    {branch.phone && (
                      <span className="flex items-center gap-1.5"><Phone size={12} /> {branch.phone}</span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Table2 size={12} />
                      <span>
                        <strong className="text-foreground/70">{branch.tableCount}</strong> mesas
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/branches/${branch.id}/menu`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                  >
                    <Settings size={13} /> Configurar Menú
                  </Link>
                  <button
                    onClick={() => handleOpenEdit(branch)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
                  >
                    <Edit2 size={13} /> Editar
                  </button>
                  {!branch.isMain && (
                    <button
                      onClick={() => handleDelete(branch)}
                      disabled={deleting === branch.id}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/20 transition-colors disabled:opacity-50"
                    >
                      {deleting === branch.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
