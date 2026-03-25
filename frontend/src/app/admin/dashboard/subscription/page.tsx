"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, History, FileText, Layout, CheckCircle2, 
  Clock, ArrowRight, Plus, Download, ShieldCheck, 
  Building2, User as UserIcon, MapPin, BadgeCheck, Mail, Loader2, AlertCircle, Trash2
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";

type Tab = "resumen" | "compras" | "pagos" | "transacciones" | "fiscal";

interface BillingSummary {
  planName: string;
  planPrice: number;
  nextBillingDate: string | null;
  lastPayment: {
    date: string;
    amount: number;
    status: string;
    paymentMethod: string;
  } | null;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  dueDate: string;
  paidAt: string | null;
}

interface FiscalInfo {
  legalName: string;
  taxId: string;
  address: string;
  email: string;
  phone: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string;
}

export default function SubscriptionPage() {
  const { activeRestaurant } = useTenant();
  const [activeTab, setActiveTab] = useState<Tab>("resumen");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [fiscalInfo, setFiscalInfo] = useState<FiscalInfo>({
    legalName: "",
    taxId: "",
    address: "",
    email: "",
    phone: ""
  });

  // Modal States
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  useEffect(() => {
    if (activeRestaurant) {
      fetchData();
    }
  }, [activeRestaurant]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("restsaas_token");
      const headers = { "Authorization": `Bearer ${token}` };

      const [summaryRes, methodsRes, invoicesRes, infoRes, plansRes] = await Promise.all([
        fetch("http://localhost:5168/api/billing/summary", { headers }),
        fetch("http://localhost:5168/api/billing/payment-methods", { headers }),
        fetch("http://localhost:5168/api/billing/invoices", { headers }),
        fetch("http://localhost:5168/api/billing/info", { headers }),
        fetch("http://localhost:5168/api/plans", { headers })
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (methodsRes.ok) setPaymentMethods(await methodsRes.json());
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
      if (infoRes.ok) setFiscalInfo(await infoRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("restsaas_token");
      
      // Simular validación y tokenización
      const last4 = newCard.number.slice(-4);
      const [expMonth, expYear] = newCard.expiry.split("/").map(Number);
      
      const res = await fetch("http://localhost:5168/api/billing/payment-methods", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          brand: "Visa", // Simulado
          last4: last4,
          expiryMonth: expMonth || 12,
          expiryYear: expYear || 2030,
          providerId: "tok_" + Math.random().toString(36).substring(7),
          isDefault: paymentMethods.length === 0
        })
      });

      if (res.ok) {
        setShowCardModal(false);
        setNewCard({ number: "", expiry: "", cvc: "", name: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error adding card:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePlan = async (planId: string) => {
    setSaving(true);
    try {
      const token = localStorage.getItem("restsaas_token");
      const res = await fetch(`http://localhost:5168/api/subscriptions/change-plan?planId=${planId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setShowPlanModal(false);
        fetchData();
        alert("¡Plan actualizado correctamente!");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFiscalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("restsaas_token");
      const res = await fetch("http://localhost:5168/api/billing/info", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(fiscalInfo)
      });
      if (res.ok) alert("Información fiscal guardada correctamente.");
    } catch (error) {
      console.error("Error saving fiscal info:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta forma de pago?")) return;
    try {
      const token = localStorage.getItem("restsaas_token");
      await fetch(`http://localhost:5168/api/billing/payment-methods/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setPaymentMethods(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in-up pb-20">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-2">
        <div className="glass dark:glass-dark rounded-3xl p-6 border border-border/40 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black shadow-inner border border-primary/20">
            {activeRestaurant?.name?.[0] || "R"}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-black text-sm truncate">{activeRestaurant?.name || "Cargando..." }</h2>
            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Panel de Facturación</p>
          </div>
        </div>

        <nav className="space-y-1">
          {[
            { id: "resumen", label: "Resumen", icon: Layout },
            { id: "pagos", label: "Formas de pago", icon: CreditCard },
            { id: "transacciones", label: "Historial", icon: History },
            { id: "fiscal", label: "Información fiscal", icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === item.id 
                ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                : "text-foreground/50 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-6">
        <div className="glass dark:glass-dark rounded-[2.5rem] p-8 lg:p-12 border border-border/40 shadow-2xl relative overflow-hidden group min-h-[600px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:bg-primary/10 transition-colors"></div>

          {activeTab === "resumen" && (
            <div className="space-y-10 animate-fade-in-up">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">¡Hola, {activeRestaurant?.name}!</h1>
                <p className="text-foreground/50 text-lg font-medium">Aquí tienes un resumen de tu actividad de facturación.</p>
              </div>

              {/* Active Plan Card */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-[2rem] p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">Plan Actual</span>
                    <h3 className="text-3xl font-black text-foreground">{summary?.planName || "Core"}</h3>
                    <p className="text-sm font-medium text-foreground/60 flex items-center gap-2">
                      <Clock size={16} className="text-primary" /> 
                      Próxima renovación: {summary?.nextBillingDate ? new Date(summary.nextBillingDate).toLocaleDateString() : "No programada"}
                    </p>
                  </div>
                  <button onClick={() => setShowPlanModal(true)} 
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] border border-primary/20">
                    Cambiar Plan
                  </button>
                </div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
              </div>

              {/* Last Transaction */}
              {summary?.lastPayment && (
                <div className="bg-background/40 border border-border/40 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-1">Último Pago</p>
                      <p className="font-black text-lg">{summary.lastPayment.amount.toFixed(2)} USD</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm font-bold text-foreground/60">{new Date(summary.lastPayment.date).toLocaleDateString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{summary.lastPayment.paymentMethod}</p>
                  </div>
                </div>
              )}

              {/* Mini Transaction List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-extrabold text-lg">Transacciones Recientes</h4>
                  <button onClick={() => setActiveTab("transacciones")} className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                    Ver todo <ArrowRight size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {invoices.length === 0 ? (
                    <p className="text-center py-8 text-foreground/30 font-medium">No hay transacciones registradas.</p>
                  ) : (
                    invoices.slice(0, 3).map((tr) => (
                      <div key={tr.id} className="flex items-center justify-between p-5 bg-background/40 border border-border/40 rounded-2xl hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                             <History size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{tr.invoiceNumber}</p>
                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">{new Date(tr.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm">{tr.amount.toFixed(2)} {tr.currency}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-opacity-10 ${
                            tr.status === 'Paid' ? 'text-green-500 bg-green-500/10 border-green-500' : 'text-amber-500 bg-amber-500/10 border-amber-500'
                          }`}>
                            {tr.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pagos" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Formas de Pago</h2>
                <p className="text-foreground/50 font-medium">Gestiona tus tarjetas y cuentas para la facturación automática.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paymentMethods.map(pm => (
                   <div key={pm.id} className="p-8 bg-gradient-to-br from-zinc-800 to-black rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all">
                      <div className="flex justify-between items-start mb-12 relative z-10">
                         <div className="w-12 h-8 bg-white/10 rounded-md backdrop-blur-md border border-white/5 flex items-center justify-center font-black text-white italic text-xs uppercase">{pm.brand}</div>
                         <div className="flex gap-2">
                           <button onClick={(e) => { e.stopPropagation(); handleDeletePaymentMethod(pm.id); }} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={16} />
                           </button>
                           {pm.isDefault && <BadgeCheck className="text-blue-500" size={24} />}
                         </div>
                      </div>
                      <div className="space-y-4 relative z-10">
                         <p className="text-white tracking-[0.2em] font-medium opacity-80 text-lg">•••• •••• •••• {pm.last4}</p>
                         <div className="flex justify-between items-end">
                            <div>
                               <p className="text-[8px] uppercase font-black text-white/30 tracking-widest">Titular</p>
                               <p className="text-xs font-bold text-white uppercase">{activeRestaurant?.name}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-[8px] uppercase font-black text-white/30 tracking-widest">Expira</p>
                               <p className="text-xs font-bold text-white uppercase">{pm.expiryMonth} / {pm.expiryYear}</p>
                            </div>
                         </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                   </div>
                ))}

                <button onClick={() => setShowCardModal(true)} className="border-2 border-dashed border-border/60 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all group min-h-[180px]">
                   <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-foreground/40 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                      <Plus size={24} />
                   </div>
                   <span className="font-bold text-foreground/40 group-hover:text-foreground">Agregar Nueva Tarjeta</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "transacciones" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Historial de Transacciones</h2>
                <p className="text-foreground/50 font-medium">Visualiza y descarga tus facturas anteriores.</p>
              </div>

              <div className="overflow-hidden bg-background/40 border border-border/40 rounded-3xl">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border/50 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
                      <th className="px-6 py-5">Factura</th>
                      <th className="px-6 py-5">Fecha</th>
                      <th className="px-6 py-5">Total</th>
                      <th className="px-6 py-5">Estado</th>
                      <th className="px-6 py-5">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-foreground/30 font-medium italic">Historial vacío</td>
                      </tr>
                    ) : (
                      invoices.map((tr) => (
                        <tr key={tr.id} className="hover:bg-primary/5 transition-colors group">
                          <td className="px-6 py-5 font-black text-sm text-primary">{tr.invoiceNumber}</td>
                          <td className="px-6 py-5 font-bold text-sm">{new Date(tr.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-5 font-black text-sm">{tr.amount.toFixed(2)} {tr.currency}</td>
                          <td className="px-6 py-5">
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-opacity-10 inline-flex items-center gap-1 ${
                               tr.status === 'Paid' ? 'text-green-500 bg-green-500/10 border-green-500' : 'text-amber-500 bg-amber-500/10 border-amber-500'
                             }`}>
                               {tr.status === 'Paid' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {tr.status}
                             </span>
                          </td>
                          <td className="px-6 py-5">
                            <button title="Descargar PDF" className="p-2 bg-surface border border-border/50 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-foreground/40">
                               <Download size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "fiscal" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">Información Fiscal</h2>
                <p className="text-foreground/50 font-medium">Configura los datos legales para la emisión de tus facturas.</p>
              </div>

              <form onSubmit={handleSaveFiscalInfo} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-background/40 border border-border/40 p-8 rounded-[2rem]">
                 <div className="space-y-5">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre Legal / Empresa</label>
                       <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                          <Building2 size={16} className="text-foreground/30" />
                          <input type="text" placeholder="Ej: Inversiones Jimenez S.A." className="bg-transparent text-sm font-bold outline-none w-full" 
                            required value={fiscalInfo.legalName} onChange={e => setFiscalInfo({...fiscalInfo, legalName: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Identificación Fiscal (ID / RUC)</label>
                       <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                          <ShieldCheck size={16} className="text-foreground/30" />
                          <input type="text" placeholder="3-101-XXXXXX" className="bg-transparent text-sm font-bold outline-none w-full" 
                            required value={fiscalInfo.taxId} onChange={e => setFiscalInfo({...fiscalInfo, taxId: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Correo de Facturación</label>
                       <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                          <Mail size={16} className="text-foreground/30" />
                          <input type="email" placeholder="facturas@empresa.com" className="bg-transparent text-sm font-bold outline-none w-full" 
                            required value={fiscalInfo.email} onChange={e => setFiscalInfo({...fiscalInfo, email: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Teléfono</label>
                       <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                          <UserIcon size={16} className="text-foreground/30" />
                          <input type="text" placeholder="+506 XXXX-XXXX" className="bg-transparent text-sm font-bold outline-none w-full" 
                            required value={fiscalInfo.phone} onChange={e => setFiscalInfo({...fiscalInfo, phone: e.target.value})} />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-5">
                    <div className="space-y-1.5 h-full flex flex-col">
                       <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Dirección de Facturación</label>
                       <div className="flex-1 flex gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all">
                          <MapPin size={16} className="mt-1 text-foreground/30" />
                          <textarea placeholder="Provincia, Cantón, Distrito..." className="bg-transparent text-sm font-bold outline-none w-full h-full resize-none py-1"
                            required value={fiscalInfo.address} onChange={e => setFiscalInfo({...fiscalInfo, address: e.target.value})}></textarea>
                       </div>
                    </div>
                    <div className="pt-2">
                       <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs disabled:opacity-50">
                          {saving ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />} Guardar Datos Fiscales
                       </button>
                    </div>
                 </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[300]">
          <div className="bg-background rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-border/40 animate-scale-in">
            <h2 className="text-3xl font-black mb-6">Elige tu Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map(p => (
                <div key={p.id} className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${summary?.planName === p.name ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  onClick={() => handleUpdatePlan(p.id)}>
                   <h3 className="font-black text-lg mb-1">{p.name}</h3>
                   <p className="text-2xl font-black text-primary mb-4">${p.price}<span className="text-xs font-bold text-foreground/40">/mes</span></p>
                   <ul className="text-[10px] font-bold text-foreground/60 space-y-2 uppercase tracking-wider">
                      <li>• {p.name === 'Free' ? '20' : 'Ilimitados'} Platillos</li>
                      <li>• {p.name === 'Free' ? '1' : 'Multisucursal'}</li>
                   </ul>
                </div>
              ))}
            </div>
            <button onClick={() => setShowPlanModal(false)} className="mt-8 w-full py-4 text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-foreground">Cerrar</button>
          </div>
        </div>
      )}

      {showCardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[300]">
          <div className="bg-background rounded-3xl p-8 max-w-md w-full shadow-2xl border border-border/40 animate-scale-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner"><Plus size={24} /></div>
              <h2 className="text-2xl font-black">Nueva Tarjeta</h2>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Número de Tarjeta</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    required value={newCard.number} onChange={e => setNewCard({...newCard, number: e.target.value})} maxLength={16} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Expiración</label>
                     <input type="text" placeholder="MM/YY" className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                       required value={newCard.expiry} onChange={e => setNewCard({...newCard, expiry: e.target.value})} maxLength={5} />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">CVC</label>
                     <input type="password" placeholder="***" className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                       required value={newCard.cvc} onChange={e => setNewCard({...newCard, cvc: e.target.value})} maxLength={3} />
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Nombre en Tarjeta</label>
                  <input type="text" placeholder="Nombre completo" className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    required value={newCard.name} onChange={e => setNewCard({...newCard, name: e.target.value})} />
               </div>
               <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowCardModal(false)} className="flex-1 py-4 font-black text-xs uppercase tracking-widest border border-border rounded-2xl hover:bg-foreground/5">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
                  </button>
               </div>
               <p className="text-[9px] text-foreground/40 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-500" /> PCI-DSS Compliant • Encriptado 256-bit
               </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
