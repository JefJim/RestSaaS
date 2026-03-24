"use client";

import { useState, useEffect } from 'react';
import { useTenant } from '@/context/TenantContext';
import { UserPlus, Shield, User, Trash2, Mail } from 'lucide-react';

export default function StaffPage() {
  const { activeRestaurant } = useTenant();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Staff');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRestaurant) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem("restsaas_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      
      const res = await fetch(`${apiUrl}/api/restaurants/${activeRestaurant.id}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, role })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Personal añadido correctamente.' });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Error al añadir personal.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-foreground mb-2">Personal del Equipo</h1>
        <p className="text-foreground/60 font-medium">Gestiona quién tiene acceso a {activeRestaurant?.name}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Staff Form */}
        <div className="lg:col-span-1">
          <div className="glass dark:glass-dark rounded-3xl p-8 border border-primary/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus size={20} />
              </div>
              <h3 className="text-xl font-bold">Añadir Miembro</h3>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">Email del Usuario</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    className="w-full bg-foreground/5 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">Rol Asignado</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('Admin')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                      role === 'Admin' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-foreground/5 text-foreground/40'
                    }`}
                  >
                    <Shield size={18} />
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Staff')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold ${
                      role === 'Staff' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-foreground/5 text-foreground/40'
                    }`}
                  >
                    <User size={18} />
                    <span>Staff</span>
                  </button>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl text-sm font-bold ${
                  message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Añadiendo...' : 'Enviar Invitación'}
              </button>
            </form>
          </div>
        </div>

        {/* Staff List (Placeholder) */}
        <div className="lg:col-span-2">
          <div className="glass dark:glass-dark rounded-3xl border border-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-foreground/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Miembro</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Rol</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Estado</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Normally we would fetch this list from the server */}
                <tr className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">T</div>
                      <div>
                        <p className="font-bold text-sm">Tú (Propietario)</p>
                        <p className="text-xs text-foreground/40">dueño@restaurante.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-yellow-500/20">
                      Owner
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Activo
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-foreground/20 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-12 text-center text-foreground/40 font-medium">
              El resto de los miembros aparecerán aquí una vez que acepten la invitación.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
