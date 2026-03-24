import Link from "next/link";
import Image from "next/image";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background p-8 md:p-16 text-foreground font-sans selection:bg-primary/30">
      <div className="max-w-4xl mx-auto glass dark:glass-dark p-8 md:p-12 rounded-3xl shadow-2xl relative">
        <Link href="/" className="inline-block mb-8 text-primary hover:underline font-medium">
          &larr; Volver al inicio
        </Link>
        <div className="flex items-center gap-6 mb-10">
          <Image src="/logo.png" alt="TableHive Logo" width={120} height={120} className="drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold tracking-tight">Términos de Servicio</h1>
        </div>
        
        <p className="text-foreground/60 mb-8">Última actualización: Marzo 2026</p>

        <article className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p>Bienvenido a <strong>TableHive</strong>. Al acceder a nuestro sitio web y plataforma, aceptas estar sujeto a estos Términos de Servicio, a todas las leyes y regulaciones aplicables, y eres responsable del cumplimiento de las leyes locales de tu país.</p>
          
          <h2 className="text-2xl font-bold mt-8 text-foreground">1. Aceptación de los Términos</h2>
          <p>Estos términos se rigen por las leyes de la República de Costa Rica. Al crear una cuenta, aceptas estos términos en su totalidad. Si no estás de acuerdo, por favor no utilices nuestros servicios.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">2. Licencia de Uso</h2>
          <p>TableHive te otorga una licencia limitada e intransferible para usar nuestra plataforma de Software as a Service (SaaS) con el fin de administrar la presencia digital de tu restaurante. Los datos de tu restaurante seguirán siendo de tu propiedad, pero TableHive se reserva el derecho de suspender cuentas que infrinjan nuestras políticas de uso.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">3. Pagos y Suscripciones</h2>
          <p>Las suscripciones se cobran facturan por adelantado. De conformidad con las leyes de protección al consumidor de Costa Rica, puedes cancelar tu suscripción en cualquier momento, pero no se proporcionarán reembolsos parciales a menos que la ley lo exija.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">4. Limitación de Responsabilidad</h2>
          <p>En ningún caso TableHive o sus proveedores serán responsables por los daños derivados del uso o la imposibilidad de utilizar la plataforma y los servicios provistos.</p>
        </article>
      </div>
    </main>
  );
}
