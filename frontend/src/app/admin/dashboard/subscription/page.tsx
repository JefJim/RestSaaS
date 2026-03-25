"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, History, FileText, Layout, CheckCircle2, 
  Clock, ArrowRight, Plus, Download, ShieldCheck, 
  Building2, User as UserIcon, MapPin, BadgeCheck, Mail, Loader2, AlertCircle, Trash2
} from "lucide-react";
import { useTenant } from "@/context/TenantContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("restsaas_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.email || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
        if (email) setUserEmail(email);
      } catch (e) {
        console.error("Error parsing token", e);
      }
    }
  }, []);

  useEffect(() => {
    // Handle Stripe Checkout redirects
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      alert('¡Suscripción creada exitosamente!');
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchData(); // Refresh data
    } else if (urlParams.get('canceled') === 'true') {
      alert('La suscripción fue cancelada.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const [summaryRes, methodsRes, invoicesRes, infoRes, plansRes] = await Promise.all([
        fetch(`${apiUrl}/api/billing/summary`, { headers }),
        fetch(`${apiUrl}/api/billing/payment-methods`, { headers }),
        fetch(`${apiUrl}/api/billing/invoices`, { headers }),
        fetch(`${apiUrl}/api/billing/info`, { headers }),
        fetch(`${apiUrl}/api/plans`, { headers })
      ]);

      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (methodsRes.ok) setPaymentMethods(await methodsRes.json());
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
      
      // Manejar el caso donde no hay info fiscal aún
      if (infoRes.ok) {
        setFiscalInfo(await infoRes.json());
      } else if (infoRes.status === 404) {
        setFiscalInfo({ legalName: "", taxId: "", address: "", email: "", phone: "" });
      }

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
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/payment-methods`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/change-plan?planId=${planId}`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/info`, {
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/payment-methods/${id}`, {
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
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 relative z-10">
                  <div className="space-y-3">
                    <span className="px-4 py-1.5 bg-primary text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">Plan Actual</span>
                    <h3 className="text-4xl font-black text-foreground drop-shadow-sm">{summary?.planName || "Core / Basic"}</h3>
                    <p className="text-base font-bold text-foreground/70 flex items-center gap-2.5">
                      <Clock size={20} className="text-primary animate-pulse" /> 
                      Próxima renovación: <span className="text-foreground font-black">{summary?.nextBillingDate ? new Date(summary.nextBillingDate).toLocaleDateString() : "No programada"}</span>
                    </p>
                  </div>
                  <button onClick={() => setShowPlanModal(true)} 
                    className="group relative px-10 py-5 bg-primary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-[0_15px_40px_-10px_rgba(var(--primary-rgb),0.6)] border-2 border-white/20 overflow-hidden whitespace-nowrap min-w-fit">
                    <span className="relative z-10">Cambiar Plan</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>
                </div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/20 rounded-full blur-[80px]"></div>
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-secondary/20 rounded-full blur-[60px]"></div>
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

      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[999999] animate-in fade-in duration-300">
           <div className="bg-white text-black rounded-none p-12 max-w-4xl w-full shadow-2xl relative overflow-y-auto max-h-[90vh] font-sans">
              <button onClick={() => setShowInvoiceModal(false)} className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors text-black/40">
                 <Plus size={24} className="rotate-45" />
              </button>

              <div className="flex justify-between items-start border-b-4 border-blue-800 pb-8 mb-8">
                 <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-blue-800">Factura de TableHive</h2>
                    <div className="bg-blue-50 p-4 border-l-4 border-blue-800 rounded-r-lg max-w-md">
                       <p className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-1">Nota importante</p>
                       <p className="text-[11px] leading-relaxed text-blue-800">
                         Cuando termine el periodo de prueba gratis el {new Date(new Date(selectedInvoice.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}, pagarás la tarifa del plan seleccionado mensualmente hasta que canceles.
                       </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-4xl font-black italic text-blue-900 mb-2">TableHive</div>
                    <p className="text-xs text-black/60">San José, Costa Rica</p>
                    <p className="text-xs text-black/60">VAT: CR-2025-TABLEHIVE</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-10">
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">Facturado a</p>
                       <p className="font-bold text-lg">{fiscalInfo.legalName || activeRestaurant?.name}</p>
                       <p className="text-sm text-black/70">{fiscalInfo.address || "Costa Rica"}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">ID Fiscal del Cliente</p>
                       <p className="text-sm font-bold">{selectedInvoice.customerTaxId || "No aplicable"}</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">Fecha efectiva</p>
                          <p className="font-bold">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">Número de factura</p>
                          <p className="font-bold">{selectedInvoice.invoiceNumber}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">Forma de pago</p>
                          <p className="font-bold uppercase">{selectedInvoice.paymentMethodDetail || "Prueba Gratuita"}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">ID Transacción</p>
                          <p className="font-bold">{selectedInvoice.transactionId || "N/A"}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">Frecuencia</p>
                          <p className="font-bold">Mensual</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-1">Comprador</p>
                          <p className="font-bold text-blue-700 truncate">{selectedInvoice.billingEmail || userEmail || "jefryjimenez2011@gmail.com"}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mb-10">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-black text-white text-[10px] font-black uppercase tracking-widest">
                          <th className="py-3 px-4">Artículo</th>
                          <th className="py-3 px-4">Descripción</th>
                          <th className="py-3 px-4 text-right">Tarifa</th>
                          <th className="py-3 px-4 text-center">Cant.</th>
                          <th className="py-3 px-4 text-right">Precio</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-black/5">
                             <td className="py-4 px-4 font-bold">{idx + 1}</td>
                             <td className="py-4 px-4">
                               <p className="font-bold">{item.description}</p>
                               <p className="text-xs text-black/40">Del {new Date(selectedInvoice.createdAt).toLocaleDateString()} al {new Date(new Date(selectedInvoice.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                             </td>
                             <td className="py-4 px-4 text-right">{item.amount.toLocaleString()} {selectedInvoice.currency}</td>
                             <td className="py-4 px-4 text-center">{item.quantity}</td>
                             <td className="py-4 px-4 text-right font-bold">{(item.amount * item.quantity).toLocaleString()} {selectedInvoice.currency}</td>
                          </tr>
                       )) : (
                          <tr className="border-b border-black/5">
                             <td className="py-4 px-4 font-bold">1</td>
                             <td className="py-4 px-4">Suscripción Manual - Período Inicial</td>
                             <td className="py-4 px-4 text-right">{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}</td>
                             <td className="py-4 px-4 text-center">1</td>
                             <td className="py-4 px-4 text-right font-bold">{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              <div className="flex justify-end mb-12">
                 <div className="w-64 space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold text-black/60">
                       <span>Subtotal :</span>
                       <span>{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-black/60">
                       <span>Impuesto (0%) :</span>
                       <span>0 {selectedInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-black border-t-2 border-black pt-4">
                       <span>Total :</span>
                       <span>{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold text-green-600">
                       <span>Pago recibido :</span>
                       <span>{selectedInvoice.amount.toLocaleString()} {selectedInvoice.currency}</span>
                    </div>
                 </div>
              </div>

              <div className="border-t border-black/10 pt-8 text-[11px] text-black/50 leading-relaxed text-center italic">
                 ¿Tienes dudas o necesitas ayuda? Visita nuestro Centro de ayuda o contacta a soporte@tablehive.com
               </div>
            </div>
         </div>
      )}

      {showPlanModal && (
        <Elements stripe={stripePromise}>
           <PlanUpgradeModal 
             plans={plans} 
             summary={summary}
             onClose={() => setShowPlanModal(false)} 
             onSuccess={() => { fetchData(); setShowPlanModal(false); }}
           />
        </Elements>
      )}
      {showCardModal && (
        <Elements stripe={stripePromise}>
           <AddCardModal 
             onClose={() => setShowCardModal(false)} 
             onSuccess={() => { fetchData(); setShowCardModal(false); }}
           />
        </Elements>
      )}
    </div>
  );
}

// --- Stripe Components ---

function AddCardModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem("restsaas_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/stripe-setup-intent`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const clientSecret = data.clientSecret;

      const result = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/admin/dashboard/subscription",
        },
        redirect: "if_required"
      });

      if (result.error) {
        setError(result.error.message || "Error al procesar la tarjeta");
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 z-[999999] animate-in fade-in duration-300 font-sans">
      <div className="bg-background rounded-[3rem] p-10 max-w-md w-full shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border border-border/60 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40">
          <Plus size={24} className="rotate-45" />
        </button>
        
        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-xl shadow-primary/20">
              <CreditCard size={32} />
           </div>
           <div>
              <h2 className="text-2xl font-black">Nueva Tarjeta</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Pago seguro encriptado</p>
           </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-foreground/5 rounded-2xl border border-border/40">
            <CardElement options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': { color: '#aab7c4' },
                },
                invalid: { color: '#ef4444' },
              },
            }} />
          </div>

          {error && (
            <div className="text-red-500 text-[11px] font-bold flex items-center gap-2 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
               <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={!stripe || processing}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/40 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {processing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
            {processing ? "PROCESANDO..." : "GUARDAR TARJETA SEGURA"}
          </button>
          
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/40 opacity-40">
             <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> SSL 256-bit</span>
             <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12} className="text-green-500" /> PCI Compliance</span>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlanUpgradeModal({ plans, summary, onClose, onSuccess }: { plans: any[], summary: any, onClose: () => void, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [step, setStep] = useState<"select" | "payment">("select");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (plan: any) => {
    if (plan.price === 0) {
       // Manual change for free plan
       const token = localStorage.getItem("restsaas_token");
       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/change-plan?planId=${plan.id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
       });
       onSuccess();
       return;
    }
    setSelectedPlan(plan);
    setStep("payment");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !selectedPlan) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem("restsaas_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/stripe-payment-intent?planId=${selectedPlan.id}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (result.error) {
        setError(result.error.message || "Pago fallido");
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/change-plan?planId=${selectedPlan.id}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
        onSuccess();
      }
    } catch (err) {
      setError("Error en la transacción");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 z-[99999] animate-in fade-in duration-300 font-sans text-foreground">
      <div className="bg-background rounded-[3rem] p-10 max-w-4xl w-full shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] border border-border/60 relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-3 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground">
           <Plus size={32} className="rotate-45" />
        </button>

        {step === "select" ? (
          <>
            <div className="mb-10">
              <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent italic">Mejora tu Plan</h2>
              <p className="text-foreground/50 font-bold uppercase tracking-widest text-xs">Escala tu restaurante al siguiente nivel</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map(p => (
                <div key={p.id} className={`group p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer relative overflow-hidden ${
                  summary?.planName === p.name ? 'border-primary bg-primary/5 ring-4 ring-primary/10 select-none pointer-events-none' : 'border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.05]'
                }`}
                  onClick={() => handleUpgrade(p)}>
                   <div className="relative z-10">
                      <h3 className="font-black text-xl mb-2">{p.name}</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                         <span className="text-3xl font-black text-primary italic uppercase">{p.price.toLocaleString()}</span>
                         <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{p.currency}/mes</span>
                      </div>
                      <div className="space-y-4 pt-4 border-t border-border/40">
                         {p.features ? JSON.parse(p.features).slice(0, 4).map((f: string, i: number) => (
                           <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-foreground/60 uppercase tracking-wide">
                              <CheckCircle2 size={14} className="text-green-500" /> {f}
                           </div>
                         )) : (
                           <p className="text-[10px] italic opacity-40">CARACTERÍSTICAS INCLUIDAS</p>
                         )}
                      </div>
                      <button className={`w-full mt-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        summary?.planName === p.name ? 'bg-primary text-white' : 'bg-foreground/5 text-foreground/60 group-hover:bg-primary group-hover:text-white shadow-xl group-hover:shadow-primary/20'
                      }`}>
                        {summary?.planName === p.name ? 'Tu Plan Actual' : 'Seleccionar'}
                      </button>
                   </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] italic">Seguridad garantizada por Stripe • Cancela en cualquier momento</p>
          </>
        ) : (
          <div className="max-w-md mx-auto py-10 text-center">
             <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="text-primary" />
             </div>
             <h2 className="text-3xl font-black mb-2">Finalizar Pago</h2>
             <p className="text-foreground/60 font-bold mb-10 text-sm uppercase tracking-wider">
               Plan {selectedPlan.name} • {selectedPlan.price.toLocaleString()} {selectedPlan.currency}
             </p>
             
             <form onSubmit={handlePayment} className="space-y-6 text-left">
                <div className="p-5 bg-foreground/5 rounded-[2rem] border-2 border-border/40 focus-within:border-primary/50 transition-all shadow-inner">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#ffffff',
                        fontFamily: 'system-ui, sans-serif',
                        '::placeholder': { color: '#aab7c4' },
                      },
                    },
                  }} />
                </div>

                {error && (
                  <div className="text-red-500 text-xs font-black bg-red-500/10 p-4 rounded-2xl border border-red-500/20 uppercase tracking-tight italic">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={!stripe || processing}
                  className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/40 disabled:opacity-50 flex items-center justify-center gap-3 italic"
                >
                  {processing ? <Loader2 className="animate-spin" size={20} /> : <BadgeCheck size={20} />}
                  {processing ? "PROCESANDO..." : `CONFIRMAR Y PAGAR`}
                </button>
                <button type="button" onClick={() => setStep("select")} className="w-full text-[10px] font-black uppercase text-foreground/30 tracking-widest hover:text-foreground transition-colors pt-2">
                   ← Volver a selección de planes
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
}
