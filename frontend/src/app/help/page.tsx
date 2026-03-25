"use client";

import { HelpCircle, Mail, MessageCircle, ArrowRight, ChevronDown, ChevronUp, Search, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useTenant } from "@/context/TenantContext";
import { useEffect, useState } from "react";

export default function HelpPage() {
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("restsaas_token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload["email"] || "";
        setUserEmail(email);
      } catch (e) { console.error("Error parsing token", e); }
    }
  }, []);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Hola equipo de TableHive,\n\nMi correo es: ${userEmail}\n\n[Escribe tu mensaje aquí]`;
    window.location.href = `mailto:tablehive@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowEmailModal(false);
  };

  const faqs = [
    {
      q: "¿Cómo puedo agregar más sucursales?",
      a: "Para agregar más sucursales, debes ir a la sección 'Sucursales' en tu panel de administración. Si has alcanzado el límite de tu plan actual, verás un botón para mejorar tu suscripción."
    },
    {
      q: "¿Cómo cambio la información fiscal de mi empresa?",
      a: "Puedes gestionar tu información fiscal desde el panel de 'Facturación' en la configuración de perfil. Allí podrás ingresar el nombre de la empresa, ID fiscal y dirección de facturación."
    },
    {
      q: "¿Cómo configuro el menú digital?",
      a: "En la pestaña 'Menú Digital' puedes crear categorías y platillos. Una vez creados, el sistema genera automáticamente un enlace público y un código QR para que tus clientes lo escaneen."
    },
    {
      q: "¿Qué métodos de pago aceptan para la suscripción?",
      a: "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) a través de nuestra pasarela de pagos segura."
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center" suppressHydrationWarning>
      {/* Navigation Header */}
      <header className="w-full h-16 bg-surface/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xs">RS</div>
          <span className="font-black text-sm tracking-tight">Centro de Ayuda</span>
        </div>
        <Link 
          href="/admin/dashboard" 
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
        >
          Regresar al Panel
          <ArrowRight size={14} />
        </Link>
      </header>

      <div className="max-w-4xl w-full space-y-16 py-20 px-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto shadow-inner border border-primary/20">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-5xl font-black tracking-tight text-foreground">¿En qué podemos ayudarte?</h1>
          <p className="text-foreground/50 text-xl font-medium">Encuentra respuestas rápidas o contacta con nuestro equipo de soporte.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto w-full relative group">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          <div className="flex items-center gap-4 bg-surface/50 border border-border/50 rounded-3xl px-6 py-4 backdrop-blur-xl shadow-2xl focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary/50 transition-all">
            <Search size={22} className="text-foreground/30" />
            <input 
              type="text" 
              placeholder="Buscar soluciones, tutoriales..."
              className="bg-transparent text-lg font-medium outline-none w-full placeholder:text-foreground/20"
            />
          </div>
        </div>

        {/* Support Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass dark:glass-dark rounded-[2.5rem] p-10 border border-border/40 hover:border-primary/40 hover:scale-105 transition-all group overflow-hidden relative shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner border border-primary/20">
              <MessageCircle size={28} />
            </div>
            <h3 className="text-2xl font-black mb-3 text-foreground">Soporte por WhatsApp</h3>
            <p className="text-foreground/50 mb-8 font-medium leading-relaxed">Habla directamente con un asesor técnico para resolver dudas urgentes sobre tu cuenta o sucursales.</p>
            <Link 
              href="https://wa.me/50685746795" 
              target="_blank"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Iniciar Chat
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="glass dark:glass-dark rounded-[2.5rem] p-10 border border-border/40 hover:border-primary/40 hover:scale-105 transition-all group overflow-hidden relative shadow-2xl">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 shadow-inner border border-secondary/20">
              <Mail size={28} />
            </div>
            <h3 className="text-2xl font-black mb-3 text-foreground">Correo Electrónico</h3>
            <p className="text-foreground/50 mb-8 font-medium leading-relaxed">Envíanos tus sugerencias o reporta problemas técnicos. Respondemos en menos de 24 horas hábiles.</p>
            <button 
              onClick={() => setShowEmailModal(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              Enviar Email
              <ExternalLink size={18} />
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-8 pt-10">
          <h2 className="text-3xl font-black text-center text-foreground">Preguntas Frecuentes</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className={`glass border transition-all overflow-hidden ${openFaq === idx ? 'rounded-3xl border-primary/30 ring-1 ring-primary/20' : 'rounded-2xl border-border hover:border-primary/30'}`}
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className={`font-bold transition-colors ${openFaq === idx ? 'text-primary' : 'text-foreground/80'}`}>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-foreground/30" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-foreground/50 leading-relaxed font-medium">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-10 pb-20">
          <p className="text-foreground/30 text-xs font-bold uppercase tracking-widest">Powered by RestSaaS Support Center</p>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[500] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-border shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] p-10 relative animate-in zoom-in-95 duration-200 ring-1 ring-white/10">
            <button 
              onClick={() => setShowEmailModal(false)}
              className="absolute top-8 right-8 p-3 hover:bg-foreground/10 rounded-full transition-colors bg-foreground/5"
            >
              <X size={24} className="text-foreground/60" />
            </button>

            <div className="space-y-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                  <Mail size={24} />
                </div>
                <h3 className="text-3xl font-black tracking-tight text-foreground">Contactar Soporte</h3>
                <p className="text-foreground/50 text-base font-medium">Completa los detalles para enviarnos un correo directamente a nuestro equipo técnico.</p>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Tu Correo (Auto detectado)</label>
                  <div className="flex items-center gap-3 bg-background/50 border border-border/80 rounded-2xl px-5 py-4 opacity-70">
                    <Mail size={18} className="text-foreground/30" />
                    <input 
                      type="email" 
                      value={userEmail || "no-login@restsaas.com"} 
                      disabled
                      className="bg-transparent text-sm font-bold outline-none w-full cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Asunto del Mensaje</label>
                  <div className="flex items-center gap-3 bg-background border-2 border-border focus-within:border-primary rounded-2xl px-5 py-4 transition-all shadow-inner">
                    <Search size={18} className="text-foreground/30" />
                    <input 
                      type="text" 
                      required
                      placeholder="Ej: Problema con la facturación"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="bg-transparent text-sm font-bold outline-none w-full"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm"
                  >
                    Abrir Cliente de Correo
                    <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
