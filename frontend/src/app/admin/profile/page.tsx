"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, ArrowRight, Save, Key } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export default function ProfilePage() {
  const { activeRestaurant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "Jefry Jiménez Rocha",
    email: "jefryjimenez2011@gmail.com",
    role: "Dueño de Negocio"
  });

  const [passForm, setPassForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert("Perfil actualizado correctamente");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary to-secondary shadow-2xl flex items-center justify-center text-white text-3xl font-black border-4 border-background ring-1 ring-primary/20">
          {user.name[0]}
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{user.name}</h1>
          <p className="text-foreground/50 font-medium flex items-center gap-2">
            <Shield size={14} className="text-primary" /> {user.role} en {activeRestaurant?.name || "Rest SSS"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass dark:glass-dark rounded-3xl p-8 border border-border/40 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
              <User size={20} className="text-primary" /> Información Personal
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre Completo</label>
                  <div className="flex items-center gap-3 bg-background/50 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                    <User size={16} className="text-foreground/30" />
                    <input 
                      type="text" 
                      value={user.name} 
                      onChange={e => setUser({...user, name: e.target.value})}
                      className="bg-transparent text-sm font-medium outline-none w-full"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Correo Electrónico</label>
                  <div className="flex items-center gap-3 bg-background/20 border border-border/50 rounded-xl px-4 py-3 opacity-70 cursor-not-allowed">
                    <Mail size={16} className="text-foreground/30" />
                    <input 
                      type="email" 
                      value={user.email} 
                      disabled
                      className="bg-transparent text-sm font-medium outline-none w-full cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-2xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>

          {/* Security */}
          <div className="glass dark:glass-dark rounded-3xl p-8 border border-border/40 shadow-xl relative overflow-hidden group">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">
              <Lock size={20} className="text-primary" /> Seguridad
            </h3>
            
            <form className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Contraseña Actual</label>
                <div className="flex items-center gap-3 bg-background/50 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                  <Key size={16} className="text-foreground/30" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    className="bg-transparent text-sm font-medium outline-none w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nueva Contraseña</label>
                  <div className="flex items-center gap-3 bg-background/50 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                    <Lock size={16} className="text-foreground/30" />
                    <input 
                      type="password" 
                      placeholder="Mínimo 8 caracteres"
                      className="bg-transparent text-sm font-medium outline-none w-full"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Confirmar Nueva Contraseña</label>
                  <div className="flex items-center gap-3 bg-background/50 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                    <Lock size={16} className="text-foreground/30" />
                    <input 
                      type="password" 
                      placeholder="Confirma tu contraseña"
                      className="bg-transparent text-sm font-medium outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95 shadow-primary/20"
                >
                  <Key size={18} />
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Mini stats/info */}
        <div className="space-y-6">
          <div className="glass dark:glass-dark rounded-3xl p-6 border border-border/40 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4">Estado de Cuenta</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 text-[10px] font-black uppercase tracking-widest">
              Verificada
            </div>
            <p className="mt-4 text-xs text-foreground/50 leading-relaxed">
              Tu cuenta ha sido verificada y tienes acceso total a todas las funciones administrativas.
            </p>
          </div>

          <div className="glass dark:glass-dark rounded-3xl p-6 border border-border/40">
            <h4 className="font-bold text-sm mb-4">Actividad Reciente</h4>
            <div className="space-y-4">
              {[
                { action: "Sucursal creada", time: "Hace 2 horas" },
                { action: "Cambio de plan", time: "Ayer, 3:45 PM" },
                { action: "Sesión iniciada", time: "Hace 10 min" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  <div>
                    <p className="text-xs font-bold">{item.action}</p>
                    <p className="text-[10px] text-foreground/40">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-colors">
              Ver Historial Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
