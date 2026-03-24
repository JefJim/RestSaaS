"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Store, 
  Settings2, 
  CreditCard, 
  PartyPopper,
  Loader2,
  ChevronDown
} from "lucide-react";

import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'

type OnboardingData = {
  restaurantName: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  cuisine: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  planId: string;
};

const CUISINE_OPTIONS = [
  "Internacional",
  "Italiana",
  "Mexicana",
  "Española",
  "Francesa",
  "Japonesa/Sushi",
  "China",
  "Americana/Hamburgesas",
  "Argentina/Parrilla",
  "Vegana/Vegetariana",
  "Cafetería/Desayunos",
  "Pizzería",
  "Mariscos",
  "Fusión",
  "Otro"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [data, setData] = useState<OnboardingData>({
    restaurantName: "",
    slug: "",
    logoUrl: null,
    primaryColor: "#7c3aed",
    cuisine: "Internacional",
    phone: "",
    address: "",
    latitude: null,
    longitude: null,
    planId: "basic",
  });

  // Address change handler (Simplified)
  const handleAddressChange = (val: string) => {
    setData(prev => ({ ...prev, address: val }));
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (step === 1 && data.restaurantName) {
      const generatedSlug = data.restaurantName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '')
        .replace(/^-+|-+$/g, '');
      setData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [data.restaurantName, step]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("restsaas_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      
      const res = await fetch(`${apiUrl}/api/onboarding/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        const result = await res.json();
        // Update token with the new one containing RestaurantId (Phase 4.1)
        if (result.token) {
          localStorage.setItem("restsaas_token", result.token);
        }
        
        // Success! Redirect to dashboard
        router.push("/admin/dashboard");
      } else {
        const err = await res.json();
        alert(err.message || "Error al completar el registro.");
      }
    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Marca", icon: <Store size={18} /> },
    { title: "Operación", icon: <Settings2 size={18} /> },
    { title: "Plan", icon: <CreditCard size={18} /> },
    { title: "Finalizar", icon: <PartyPopper size={18} /> },
  ];

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden" suppressHydrationWarning>
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" suppressHydrationWarning></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] -z-10" suppressHydrationWarning></div>

      <div className="w-full max-w-2xl" suppressHydrationWarning>
        {/* Progress Header */}
        <div className="mb-12" suppressHydrationWarning>
          <div className="flex justify-between items-center relative gap-4" suppressHydrationWarning>
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center z-10" suppressHydrationWarning>
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                  ${step > i + 1 ? 'bg-primary text-white' : step === i + 1 ? 'bg-primary/20 border-2 border-primary text-primary shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-white/5 border border-white/10 text-white/30'}
                `} suppressHydrationWarning>
                  {step > i + 1 ? <CheckCircle2 size={18} /> : s.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${step === i + 1 ? 'text-primary' : 'text-white/30'}`} suppressHydrationWarning>
                  {s.title}
                </span>
              </div>
            ))}
            {/* Connecting Lines */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-white/5 -z-10" suppressHydrationWarning></div>
            <div className={`absolute top-5 left-0 h-[2px] bg-primary transition-all duration-700 -z-10`} style={{ width: `${(step - 1) * 33.33}%` }} suppressHydrationWarning></div>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="glass dark:glass-dark rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden" suppressHydrationWarning>
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center" suppressHydrationWarning>
                <h1 className="text-4xl font-black tracking-tight mb-2">Cuéntanos de tu marca</h1>
                <p className="text-white/50 text-sm">Define la identidad de tu restaurante. <span className="text-primary/80 font-medium italic block mt-1">Podrás editar todo después y agregar más sucursales.</span></p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8" suppressHydrationWarning>
                <div className="space-y-6" suppressHydrationWarning>
                  <Input 
                    label="Nombre del Restaurante" 
                    placeholder="Ej. Pizza Luna" 
                    value={data.restaurantName}
                    onChange={(e) => setData({ ...data, restaurantName: e.target.value })}
                  />
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">Slug / URL Personalizada</label>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 group focus-within:border-primary/50 transition-all">
                      <span className="text-white/30 text-xs font-medium">tablehive.com/</span>
                      <input 
                        className="bg-transparent border-none focus:outline-none text-sm font-bold ml-1 flex-1 text-primary"
                        value={data.slug}
                        readOnly
                      />
                    </div>
                    <p className="text-[10px] text-white/30 mt-2 italic">Esto es lo que tus clientes verán en la URL.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block text-center">Logo del Restaurante <span className="text-[9px] lowercase opacity-50 font-normal">(Opcional)</span></label>
                  <ImageUpload 
                    value={data.logoUrl || ""}
                    onChange={(url) => setData({ ...data, logoUrl: url })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNext} 
                  disabled={!data.restaurantName || !data.slug}
                  className="px-10 py-4 h-auto text-lg gap-2"
                >
                  Continuar <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2">Configuración Operativa</h1>
                <p className="text-white/50">Información básica para tus clientes y reservaciones.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Tipo de Cocina (Opcional)</label>
                  <div className="relative">
                    <select 
                      className="flex h-12 w-full items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer pr-10"
                      value={data.cuisine}
                      onChange={(e) => setData({ ...data, cuisine: e.target.value })}
                    >
                      {CUISINE_OPTIONS.map(opt => (
                        <option key={opt} value={opt} className="bg-[#0f172a] text-white">{opt}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Teléfono / WhatsApp (Opcional)</label>
                  <PhoneInput
                    placeholder="Número de contacto"
                    value={data.phone}
                    onChange={(val) => setData({ ...data, phone: val || "" })}
                    className="flex h-12 w-full items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus-within:border-primary/50 transition-all"
                    defaultCountry="MX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 block">Dirección Física (Opcional)</label>
                  <input 
                    id="address-input"
                    className="flex h-12 w-full items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Calle, número, colonia, ciudad" 
                    value={data.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ChevronLeft size={20} /> Atrás
                </Button>
                <Button onClick={handleNext} className="px-10 gap-2">
                  Continuar <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2">Elige tu Plan</h1>
                <p className="text-white/50">Elige el nivel de potencia para tu restaurante.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Basic Plan */}
                <div 
                  onClick={() => setData({ ...data, planId: "basic" })}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col relative overflow-hidden ${data.planId === "basic" ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[7px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-wider animate-pulse">14 Días Gratis</div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Core / Basic 🐝</h3>
                    <p className="text-primary font-black text-xl mt-1">₡25,000<span className="text-[10px] font-medium text-white/40 ml-1">/mes</span></p>
                  </div>
                  <ul className="text-[11px] space-y-2 text-white/70 font-medium flex-1">
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> subdominio.tablehive.com</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Menú Digital (Lectura)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Widget de Horarios/Ubicación</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Botón WhatsApp Directo</li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div 
                  onClick={() => setData({ ...data, planId: "pro" })}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col ${data.planId === "pro" ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="absolute top-0 right-0 bg-primary text-white text-[7px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-tighter">Recomendado</div>
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Pro Tier ✨</h3>
                    <p className="text-primary font-black text-xl mt-1">₡40,000<span className="text-[10px] font-medium text-white/40 ml-1">/mes</span></p>
                  </div>
                  <ul className="text-[11px] space-y-2 text-white/70 font-medium flex-1">
                    <li className="flex items-start gap-2 font-bold text-white"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Todo lo de Basic +</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Carga de Imágenes (Platos)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Módulo de Reservaciones</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Personalización de Colores/Tema</li>
                  </ul>
                </div>

                {/* Premium Plan */}
                <div 
                  onClick={() => setData({ ...data, planId: "premium" })}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col ${data.planId === "premium" ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">Premium 👑</h3>
                    <p className="text-primary font-black text-xl mt-1">₡60,000<span className="text-[10px] font-medium text-white/40 ml-1">/mes</span></p>
                    <p className="text-[9px] text-white/30 font-bold uppercase mt-1">+ Comisiones x Transacción</p>
                  </div>
                  <ul className="text-[11px] space-y-2 text-white/70 font-medium flex-1">
                    <li className="flex items-start gap-2 font-bold text-white"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Todo lo de Pro +</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Dominios Personalizados</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Pedidos Online (Checkout)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" /> Analíticas Avanzadas & CSV</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} className="gap-2">
                  <ChevronLeft size={20} /> Atrás
                </Button>
                <Button onClick={handleNext} className="px-10 gap-2">
                  Continuar <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 text-center animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-primary/40">
                <PartyPopper size={48} className="text-primary animate-bounce" />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter mb-4">¡Todo listo!</h1>
                <p className="text-white/60 text-lg max-w-md mx-auto">
                  Estamos creando tu Colmena. En unos segundos podrás empezar a cargar tus platos y configurar tus mesas.
                </p>
              </div>

              <div className="glass p-6 rounded-2xl border border-primary/20 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-4 mb-4">
                  {data.logoUrl ? (
                    <img 
                      src={data.logoUrl} 
                      alt="Logo Preview"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover" 
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center"><Store size={24} className="text-primary" /></div>
                  )}
                  <div>
                    <h4 className="font-bold">{data.restaurantName}</h4>
                    <p className="text-[10px] text-primary font-black uppercase tracking-wider">
                      {data.planId === 'basic' ? 'Core / Basic' : data.planId === 'pro' ? 'Pro Tier' : 'Premium'}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 font-medium italic">"{data.cuisine} • {data.address}"</p>
              </div>

              <div className="flex justify-center pt-8">
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="w-full max-w-sm h-16 text-xl font-black gap-3 shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
                >
                  {loading ? <Loader2 className="animate-spin" /> : (data.planId === 'basic' ? "Iniciar mi Prueba de 14 Días 🚀" : "Lanzar mi Restaurante 🚀")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
