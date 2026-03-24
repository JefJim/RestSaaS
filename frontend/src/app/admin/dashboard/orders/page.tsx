"use client";

import { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  MoreVertical,
  ChevronRight,
  User,
  Mail,
  Receipt
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const token = localStorage.getItem("restsaas_token");
      const res = await fetch(`${apiUrl}/api/orders`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const token = localStorage.getItem("restsaas_token");
      const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(status)
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ready': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const filteredOrders = filter === "All" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <ShoppingBag className="text-primary" size={36} />
            Gestión de Pedidos
          </h2>
          <p className="text-foreground/60 mt-2 font-medium">Gestiona y actualiza el progreso de tus órdenes activas.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-surface/50 border border-border/50 rounded-2xl backdrop-blur-md">
          {["All", "Pending", "Preparing", "Ready", "Delivered"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                ${filter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:bg-foreground/5"}`}
            >
              {f === "All" ? "Todos" : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Actualizando pedidos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full py-20 bg-surface/30 border border-dashed border-border/50 rounded-[40px] flex flex-col items-center justify-center text-center">
               <Receipt size={64} className="text-foreground/10 mb-4" />
               <p className="text-xl font-bold text-foreground/40">No hay pedidos {filter !== "All" ? `con estado "${filter}"` : "aún"}.</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="glass dark:glass-dark rounded-[32px] overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 group">
                <div className="p-8">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none">Orden #{order.id.slice(0,8)}</span>
                        <h4 className="text-xl font-black text-foreground mt-1">{order.customerName}</h4>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)} animate-in fade-in zoom-in-95`}>
                      {order.status}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-2xl border border-border/50">
                      <Mail size={16} className="text-primary/60" />
                      <p className="text-sm font-bold text-foreground/80 truncate">{order.customerEmail}</p>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-foreground/5 rounded-2xl border border-border/50">
                      <Clock size={16} className="text-primary/60" />
                      <p className="text-sm font-bold text-foreground/80">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Resumen de Pedido</p>
                    {order.items.map((item: any) => (
                      <div key={item.menuItemId} className="flex justify-between items-center p-3 bg-white/40 dark:bg-black/20 rounded-xl border border-border/10">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center shadow-lg shadow-primary/20">{item.quantity}</span>
                          <span className="font-bold text-sm">{item.menuItemName}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground/60">₡{(item.unitPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-4 pt-4 border-t border-dashed border-border/50">
                       <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total Pagado</span>
                       <span className="text-2xl font-black text-primary">₡{order.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {order.status !== "Delivered" && order.status !== "Cancelled" && (
                      <>
                        <Button 
                          onClick={() => updateStatus(order.id, order.status === "Pending" ? "Preparing" : order.status === "Preparing" ? "Ready" : "Delivered")}
                          className="flex-1 rounded-2xl h-14 font-black tracking-tight"
                        >
                          {order.status === "Pending" ? "Comenzar Preparación" : order.status === "Preparing" ? "Marcar como Listo" : "Marcar como Entregado"}
                        </Button>
                        <Button variant="outline" onClick={() => updateStatus(order.id, "Cancelled")} className="rounded-2xl h-14 aspect-square border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                          <XCircle size={20} />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
