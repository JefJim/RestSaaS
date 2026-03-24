"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GoogleLoginButton } from "@/components/ui/GoogleLoginButton";

export const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Fallo en la autenticación.");
      }

      localStorage.setItem("restsaas_token", data.token);
      window.location.href = "/admin/dashboard"; 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl glass dark:glass-dark shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-20 -z-10"></div>
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Bienvenido de nuevo</h2>
        <p className="text-foreground/60 text-sm">Ingresa tus credenciales para acceder al panel.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && <div className="text-red-500 text-sm text-center font-medium bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-500/20">{error}</div>}
        
        <Input 
          label="Correo Electrónico" 
          type="email" 
          placeholder="admin@restaurante.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <div className="flex flex-col gap-1">
          <Input 
            label="Contraseña" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <a href="#" className="text-xs text-primary font-medium hover:underline self-end mt-1">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold"><span className="bg-background px-2 text-foreground/40">O continúa con</span></div>
        </div>

        <GoogleLoginButton />
      </form>
    </div>
  );
};
