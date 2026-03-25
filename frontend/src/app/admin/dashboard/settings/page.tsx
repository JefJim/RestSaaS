"use client";

import { useEffect, useState, useRef } from "react";
import { useTenant } from "@/context/TenantContext";
import {
  Settings, Store, Image as ImageIcon, Globe, Phone, Mail, MapPin,
  Save, Loader2, Check, Lock
} from "lucide-react";

interface RestaurantSettings {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  whatsAppNumber?: string;
  address?: string;
  themeConfig?: string;
}

interface PlanInfo {
  name: string;
  allowImages: boolean;
  maxBranches: number;
  maxMenuItems: number;
  features: string[];
}

export default function SettingsPage() {
  const { activeRestaurant, plan } = useTenant();
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const token = () => localStorage.getItem("restsaas_token") || "";
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";

  const plansMap: Record<string, PlanInfo> = {
    "Core / Basic": { name: "Core / Basic", allowImages: false, maxBranches: 1, maxMenuItems: 50, features: ["1 Sucursal", "50 Platillos", "Logo en pág. pública", "Reservaciones", "Sitio Web básico"] },
    "Pro Tier": { name: "Pro Tier", allowImages: true, maxBranches: 5, maxMenuItems: 200, features: ["Hasta 5 Sucursales", "200 Platillos", "Imágenes en menú", "Reservaciones", "Personal", "Analytics"] },
    "Premium": { name: "Premium", allowImages: true, maxBranches: 9999, maxMenuItems: 9999, features: ["Sucursales Ilimitadas", "Platillos Ilimitados", "Imágenes", "Pedidos Online", "Dominio Propio", "Analytics", "Reportes"] },
  };
  const activePlanInfo = plansMap[plan || "Core / Basic"] ?? plansMap["Core / Basic"];

  useEffect(() => {
    const loadData = async () => {
      if (!activeRestaurant?.restaurantId) return;
      setLoading(true);
      try {
        // Load restaurant info
        const res = await fetch(`${apiUrl}/api/restaurants/me`, {
          headers: { Authorization: `Bearer ${token()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }

      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, [activeRestaurant?.restaurantId, apiUrl]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/restaurants/${activeRestaurant?.restaurantId}/settings`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          whatsAppNumber: settings.whatsAppNumber,
          address: settings.address,
          logoUrl: settings.logoUrl,
        })
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase via API
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${apiUrl}/api/upload/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: formData
      });
      if (res.ok) {
        const { url } = await res.json();
        setSettings(s => s ? { ...s, logoUrl: url } : s);
      }
    } catch (e) { console.error("Logo upload error", e); }
  };

  const field = (label: string, icon: React.ReactNode, key: keyof RestaurantSettings, placeholder: string) => (
    <div>
      <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2.5 bg-background border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
        <span className="text-foreground/30 flex-shrink-0">{icon}</span>
        <input
          value={(settings?.[key] as string) ?? ""}
          onChange={e => setSettings(s => s ? { ...s, [key]: e.target.value } : s)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-foreground/30"
        />
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-foreground/40">
      <Loader2 size={24} className="animate-spin mr-2" /> Cargando configuración...
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Configuración</h1>
          <p className="text-sm text-foreground/50 mt-1">Personaliza tu restaurante y sitio público</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? "Guardando..." : saved ? "Guardado!" : "Guardar Cambios"}
        </button>
      </div>

      {/* Plan Badge */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-foreground/50">Plan Activo</p>
            <p className="font-black text-base">{activePlanInfo.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {activePlanInfo.features.slice(0, 3).map(f => (
            <span key={f} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{f}</span>
          ))}
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-black text-base flex items-center gap-2">
          <Store size={16} className="text-primary" /> Identidad del Restaurante
        </h3>
        
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-foreground/5">
              {(logoPreview || settings?.logoUrl) ? (
                <img
                  src={logoPreview || settings?.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Store size={28} className="text-foreground/20" />
              )}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <p className="text-sm font-bold">Logo del Restaurante</p>
            <p className="text-xs text-foreground/50">
              Esta imagen aparece en tu sitio público. Todos los planes pueden subir un logo.
            </p>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-colors"
            >
              <ImageIcon size={14} /> Subir Logo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </div>
        </div>

        {field("Nombre del Restaurante", <Store size={14} />, "name", "Ej: Pizza Luna")}
      </div>

      {/* Contact Info */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
        <h3 className="font-black text-base flex items-center gap-2">
          <Globe size={16} className="text-primary" /> Información de Contacto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field("Email de Contacto", <Mail size={14} />, "contactEmail", "info@restaurante.com")}
          
          <div>
            <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">Teléfono</label>
            <div className="flex items-center gap-2.5 bg-background border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
              <span className="text-foreground/30 flex-shrink-0"><Phone size={14} /></span>
              <input
                type="tel"
                value={(settings?.contactPhone as string) ?? ""}
                onChange={e => setSettings(s => s ? { ...s, contactPhone: e.target.value.replace(/\D/g, '') } : s)}
                placeholder="Ej: 22223333"
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground/50 mb-1.5 uppercase tracking-wider">WhatsApp</label>
            <div className="flex items-center gap-2.5 bg-background border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
              <span className="text-foreground/30 flex-shrink-0"><Phone size={14} /></span>
              <input
                type="tel"
                value={(settings?.whatsAppNumber as string) ?? ""}
                onChange={e => setSettings(s => s ? { ...s, whatsAppNumber: e.target.value.replace(/\D/g, '') } : s)}
                placeholder="Ej: 88887777"
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-foreground/30"
              />
            </div>
          </div>

          {field("Dirección", <MapPin size={14} />, "address", "Av. Central 123, San José")}
        </div>
      </div>

      {/* Branch Images — Plan Gated */}
      <div className={`bg-surface border rounded-2xl p-6 space-y-3 ${activePlanInfo.allowImages ? "border-border" : "border-border/40 opacity-60"}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base flex items-center gap-2">
            <ImageIcon size={16} className="text-primary" /> Imágenes por Sucursal
          </h3>
          {!activePlanInfo.allowImages && (
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
              <Lock size={10} /> Pro / Premium
            </span>
          )}
        </div>
        {activePlanInfo.allowImages ? (
          <p className="text-sm text-foreground/50">
            Puedes subir imágenes por sucursal desde la página de <strong>Sucursales</strong>. Las imágenes aparecen en el selector de sucursal en tu sitio público.
          </p>
        ) : (
          <p className="text-sm text-foreground/40">
            Actualiza al plan <strong>Pro Tier</strong> para agregar imágenes en sucursales y platillos del menú.
          </p>
        )}
      </div>
    </div>
  );
}
