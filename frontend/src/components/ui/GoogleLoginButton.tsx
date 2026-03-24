"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface GoogleLoginButtonProps {
  mode?: "signin" | "signup";
}

export function GoogleLoginButton({ mode = "signin" }: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
        const res = await fetch(`${apiUrl}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("restsaas_token", data.token);
          router.push("/admin/dashboard");
        } else {
          const errorText = await res.text();
          console.error("Backend Error:", errorText);
          alert("Error de autenticación con el servidor.");
        }
      } catch (error) {
        console.error("Google Auth Request Error:", error);
        alert("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      alert("Fallo al conectar con Google.");
      setLoading(false);
    },
  });

  return (
    <div className="w-full flex justify-center">
      <Button 
        type="button"
        variant="outline" 
        onClick={() => {
          setLoading(true);
          login();
        }} 
        disabled={loading}
        className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 border-border/50 hover:bg-surface transition-all shadow-sm active:scale-95"
      >
        {loading ? <Loader2 className="animate-spin text-primary" /> : (
          <>
            <svg width="20" height="20" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.956L3.964 7.29C4.672 3.163 6.656 1.584 9 1.584z" fill="#EA4335"/>
            </svg>
            <span className="font-bold text-sm tracking-tight text-foreground/80">
              {mode === "signup" ? "Registrarse con Google" : "Continuar con Google"}
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
