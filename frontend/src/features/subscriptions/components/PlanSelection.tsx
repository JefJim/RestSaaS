"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string; // JSON string
}

export const PlanSelection = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("restsaas_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      try {
        const [plansRes, subRes] = await Promise.all([
          fetch(`${apiUrl}/api/plans`),
          fetch(`${apiUrl}/api/subscriptions/me`, {
            headers: { "Authorization": `Bearer ${token}` }
          })
        ]);
        
        const plansData = await plansRes.json();
        setPlans(plansData);
        
        if (subRes.ok) {
          const subData = await subRes.json();
          setCurrentSubscription(subData);
        }
      } catch (err) {
        console.error("Error fetching subscription data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async (planId: string) => {
    const token = localStorage.getItem("restsaas_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    try {
      const res = await fetch(`${apiUrl}/api/subscriptions/subscribe/${planId}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      alert("Error al actualizar suscripción");
    }
  };

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'free': return <Zap className="text-blue-500" />;
      case 'pro': return <Shield className="text-primary" />;
      case 'enterprise': return <Crown className="text-yellow-500" />;
      default: return <Zap />;
    }
  };

  if (loading) return <div className="animate-pulse space-y-4">Cargando planes...</div>;

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tight">Planes y Precios</h2>
        <p className="text-foreground/60 max-w-lg mx-auto">
          Escoge el plan que mejor se adapte al crecimiento de tu restaurante.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = currentSubscription?.planId === plan.id;
          const features = JSON.parse(plan.features);

          return (
            <div 
              key={plan.id} 
              className={`relative glass dark:glass-dark rounded-[2.5rem] p-8 flex flex-col border-2 transition-all duration-500 hover:scale-[1.02] ${
                isCurrent ? 'border-primary shadow-2xl shadow-primary/20' : 'border-border/30 hover:border-border'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  PLAN ACTUAL
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
                  {getIcon(plan.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">₡{plan.price.toLocaleString()}</span>
                    <span className="text-sm text-foreground/50">/mes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1 mb-10">
                {features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check size={12} className="text-green-500" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrent}
                className={`w-full h-14 rounded-2xl font-bold text-lg shadow-xl ${
                  isCurrent ? 'bg-foreground/10 text-foreground/40 cursor-not-allowed' : 'shadow-primary/20'
                }`}
              >
                {isCurrent ? 'Suscrito' : 'Elegir Plan'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
