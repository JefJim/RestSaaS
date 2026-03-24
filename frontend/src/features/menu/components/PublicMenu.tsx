"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, ChevronRight, Minus, Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PublicMenuProps {
  restaurant: any;
  menu: any;
}

export function PublicMenu({ restaurant, menu }: PublicMenuProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any>(null);
  
  const [customer, setCustomer] = useState({ name: "", email: "" });

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.email || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Id": restaurant.id // Multi-tenant isolation header
        },
        body: JSON.stringify({
          customerName: customer.name,
          customerEmail: customer.email,
          items: cart.map(i => ({ menuItemId: i.id, quantity: i.quantity }))
        }),
      });

      if (!res.ok) throw new Error("Order failed");
      
      const orderData = await res.json();
      setOrderComplete(orderData);
      setCart([]);
    } catch (err) {
      alert("Error al procesar el pedido. Intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
        <CheckCircle2 size={80} className="text-green-500 mb-6 drop-shadow-xl" />
        <h2 className="text-4xl font-black tracking-tight mb-4 text-foreground">¡Pedido Recibido!</h2>
        <p className="text-foreground/60 max-w-md mx-auto mb-8 text-lg font-medium">
          Gracias {customer.name}. Hemos enviado un correo de confirmación a <span className="text-primary font-bold">{customer.email}</span>.
        </p>
        <div className="glass dark:glass-dark p-6 rounded-3xl w-full max-w-sm mb-8 border border-green-500/20 shadow-xl">
           <p className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-1">Orden ID</p>
           <p className="text-xl font-black text-foreground truncate">{orderComplete.id}</p>
        </div>
        <Button onClick={() => setOrderComplete(null)} size="lg" className="rounded-2xl px-12">
          Volver al Menú
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.categories.flatMap((cat: any) => cat.items).map((item: any) => (
          <div key={item.id} className="group glass rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col dark:glass-dark">
            <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-300 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700"></div>
              )}
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold tracking-tight">{item.name}</h3>
                <span className="text-lg font-bold text-primary">₡{item.price.toLocaleString()}</span>
              </div>
              <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
                {item.description}
              </p>
              <Button 
                variant="outline" 
                className="w-full rounded-2xl hover:bg-primary hover:text-white transition-all group-hover:border-primary"
                onClick={() => addToCart(item)}
              >
                Añadir al Carrito
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-background h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col border-l border-border/50">
            <div className="p-8 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Tu Pedido</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-surface rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                   <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                     <ShoppingBag size={32} className="text-primary/20" />
                   </div>
                   <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 group animate-in slide-in-from-bottom-2">
                    <div className="w-16 h-16 rounded-2xl bg-surface overflow-hidden relative border border-border/50 shrink-0">
                      {item.imageUrl && <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-foreground truncate">{item.name}</h4>
                      <p className="text-primary font-bold text-sm">₡{(item.price * item.quantity).toLocaleString()}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/20 transition-all">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-surface border border-border hover:bg-primary/10 hover:border-primary/20 transition-all">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-foreground/20 hover:text-red-500 transition-colors self-start opacity-0 group-hover:opacity-100">
                      <X size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t border-border/50 space-y-6 bg-surface/30 backdrop-blur-xl">
                 <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre Completo</label>
                      <input 
                        required
                        className="w-full bg-background border border-border/50 p-4 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                        placeholder="Ej. Juan Pérez"
                        value={customer.name}
                        onChange={e => setCustomer({ ...customer, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Correo Electrónico</label>
                      <input 
                        required
                        type="email"
                        className="w-full bg-background border border-border/50 p-4 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                        placeholder="ejemplo@correo.com"
                        value={customer.email}
                        onChange={e => setCustomer({ ...customer, email: e.target.value })}
                      />
                    </div>
                    
                    <div className="pt-4 space-y-4">
                      <div className="flex justify-between items-end border-b border-dashed border-border/50 pb-4">
                        <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Total del Pedido</p>
                        <p className="text-3xl font-black text-primary">₡{total.toLocaleString()}</p>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full h-16 rounded-2xl text-lg font-black tracking-tight shadow-xl shadow-primary/20"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Confirmar Pedido"}
                      </Button>
                    </div>
                 </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Trigger */}
      {cart.length > 0 && !isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-8 bg-primary text-white px-8 py-5 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 z-50 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 font-bold"
        >
          <div className="relative">
            <ShoppingBag />
            <span className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-white text-primary text-[10px] flex items-center justify-center border-2 border-primary leading-none shadow-sm">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <span>Ver Mi Pedido</span>
          <ChevronRight size={18} className="opacity-50" />
        </button>
      )}
    </>
  );
}
