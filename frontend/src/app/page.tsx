import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/layouts/Footer";

export default async function Home() {
  let restaurantCount = 0;
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    // Prevent build failures if API is unreachable by catching errors
    const res = await fetch(`${apiUrl}/api/stats`, { next: { revalidate: 30 } });
    if (res.ok) {
      const data = await res.json();
      restaurantCount = data.restaurantCount || 0;
    }
  } catch (error) {
    console.error("Failed to fetch platform stats", error);
  }

  const displayCount = restaurantCount > 0 ? restaurantCount : "100+";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background flex flex-col items-center selection:bg-primary/30">

      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob dark:opacity-20"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000 dark:opacity-20"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000 dark:opacity-20"></div>

      {/* Navigation */}
      <nav className="w-full px-12 py-6 flex justify-between items-center z-50 glass sticky top-0 border-b border-foreground/5 shadow-2xl transition-all duration-500">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 relative overflow-hidden">
            <Image
              src="/logo.png"
              alt="TableHive Logo"
              fill
              className="object-cover scale-[1.7] hover:scale-[1.9] transition-transform duration-700"
            />
          </div>
          <span className="text-3xl font-black tracking-tighter text-foreground selection:text-white">TableHive</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-foreground/70 hover:text-primary transition-all uppercase tracking-widest">
            Iniciar Sesión
          </Link>
          <Link href="/signup" className="px-8 py-3 text-sm font-black text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            Empezar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center z-10 pt-10 pb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 backdrop-blur-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
          Respaldo a {displayCount} restaurantes
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight max-w-4xl">
          La mejor plataforma para <br className="hidden md:block" />
          <span className="text-gradient">restaurantes modernos</span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/70 mb-12 max-w-2xl leading-relaxed">
          Lanza tu página web, menú digital y sistema de reservaciones en minutos. Arquitectura potente diseñada para escalar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link href="/signup" className="flex-1 h-14 rounded-full bg-foreground text-background flex items-center justify-center font-semibold text-lg hover:scale-105 transition-transform shadow-xl dark:bg-white dark:text-black">
            Prueba de 14 días
          </Link>
          <Link href="#features" className="flex-1 h-14 rounded-full glass flex items-center justify-center font-semibold text-lg hover:bg-white/20 transition-all dark:glass-dark">
            Ver Demo
          </Link>
        </div>

        {/* Mockup Dashboard / Showcase */}
        <div className="w-full mt-24 relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 glass">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
          <div className="bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md w-full h-[400px] md:h-[600px] rounded-2xl p-4 flex flex-col">
            <div className="flex gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 rounded-xl bg-background/50 border border-border overflow-hidden p-8 flex items-center justify-center relative">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Menús Hermosos</h3>
                <p className="text-foreground/60 w-64 mx-auto">A tus clientes les encantará explorar tus platillos digitales.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
