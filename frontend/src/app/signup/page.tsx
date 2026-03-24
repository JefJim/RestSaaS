import { SignupForm } from "@/features/auth/components/SignupForm";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative overflow-hidden selection:bg-secondary/30" suppressHydrationWarning>
      
      {/* Visual background elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" suppressHydrationWarning></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" suppressHydrationWarning></div>

      <Link href="/" className="absolute top-8 left-8 text-foreground/60 hover:text-foreground font-medium text-sm flex items-center gap-2 transition-colors">
        &larr; Volver al inicio
      </Link>

      <div className="z-10 w-full flex flex-col items-center" suppressHydrationWarning>
        <Image src="/logo.png" alt="TableHive Logo" width={160} height={160} className="mb-10 drop-shadow-2xl" />
        
        <SignupForm />

        <p className="mt-8 text-sm text-foreground/60 font-medium">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/admin" className="text-secondary hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
