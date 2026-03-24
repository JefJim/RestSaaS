"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("restsaas_token", data.token);
        
        // Redirect to admin or original destination
        router.push("/admin/dashboard");
      } else {
        const error = await res.json();
        alert(error.message || "Error al iniciar sesión con Google");
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-xl">
          <Loader2 className="animate-spin text-primary" />
        </div>
      )}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => alert("Google Login Failed")}
          useOneTap
          theme="filled_blue"
          shape="pill"
          width="100%"
        />
      </div>
    </div>
  );
}
