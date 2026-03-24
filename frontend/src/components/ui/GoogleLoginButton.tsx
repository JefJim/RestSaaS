"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface GoogleLoginButtonProps {
  mode?: "signin" | "signup";
}

export function GoogleLoginButton({ mode = "signin" }: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      // Ensure we use the exact same case as the backend route
      const res = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("restsaas_token", data.token);
        router.push("/admin/dashboard");
      } else {
        const errorText = await res.text();
        let message = "Error al iniciar sesión con Google";
        try {
          const errorData = JSON.parse(errorText);
          message = errorData.message || message;
        } catch (e) {
          console.error("Non-JSON error response:", errorText);
        }
        alert(message);
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert("Error de conexión con el servidor");
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
      <div className={loading ? "opacity-50 pointer-events-none w-full" : "w-full"}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => alert("Google Login Failed")}
          useOneTap
          theme="filled_blue"
          shape="pill"
          width="350px"
          text={mode === "signup" ? "signup_with" : "signin_with"}
        />
      </div>
    </div>
  );
}
