"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleLoginButton } from "@/components/ui/GoogleLoginButton";
import Link from "next/link";

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setError("");
    setLoading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantName, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al crear la cuenta.");
      }

      // Store JWT securely
      localStorage.setItem("restsaas_token", data.token);
      
      if (data.onboardingCompleted === false) {
        window.location.href = "/onboarding";
      } else {
        window.location.href = "/admin/dashboard"; 
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl glass dark:glass-dark shadow-2xl relative overflow-hidden" suppressHydrationWarning>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-20 -z-10"></div>
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Crear Cuenta</h2>
        <p className="text-foreground/60 text-sm">Empieza tu prueba gratis de 14 días.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <div className="text-red-500 text-sm text-center font-medium bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-500/20">{error}</div>}
        
        <Input 
          label="Nombre del Restaurante" 
          type="text" 
          placeholder="Ej: Pizza Luna" 
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          required 
        />
        
        <Input 
          label="Correo Electrónico" 
          type="email" 
          placeholder="admin@restaurante.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <Input 
          label="Contraseña" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <div className="flex items-start gap-3 mt-2">
          <input 
            type="checkbox" 
            id="terms-checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
          />
          <label htmlFor="terms-checkbox" className="text-xs text-foreground/70 leading-relaxed cursor-pointer select-none">
            He leído y acepto los{" "}
            <Link href="/terms" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">Términos de Servicio</Link>{" "}
            y la{" "}
            <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer">Política de Privacidad</Link> (Ley 8968) de TableHive.
          </label>
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loading || !agreed}>
          {loading ? "Creando cuenta..." : "Regístrate Ahora"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
            <span className="bg-[#f8f9fa] dark:bg-[#0f1115] px-4 text-foreground/40">O regístrate con</span>
          </div>
        </div>

        <GoogleLoginButton mode="signup" />
      </form>
    </div>
  );
};
