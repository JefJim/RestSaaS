import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="w-full bg-surface dark:bg-surface-dark border-t border-border mt-auto relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <Image src="/logo.png" alt="TableHive Logo" width={90} height={90} className="drop-shadow-md" />
          <span className="text-3xl font-extrabold tracking-tight text-foreground">TableHive</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-foreground/70">
          <Link href="/terms" className="hover:text-primary transition-colors">Términos de Servicio</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Política de Privacidad</Link>
          <Link href="/admin" className="hover:text-primary transition-colors">Acceso a Restaurantes</Link>
        </div>

        <div className="text-sm text-foreground/50">
          &copy; {new Date().getFullYear()} TableHive Costa Rica. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};
