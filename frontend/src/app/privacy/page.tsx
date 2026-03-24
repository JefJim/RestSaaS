import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background p-8 md:p-16 text-foreground font-sans selection:bg-primary/30">
      <div className="max-w-4xl mx-auto glass dark:glass-dark p-8 md:p-12 rounded-3xl shadow-2xl relative">
        <Link href="/" className="inline-block mb-8 text-primary hover:underline font-medium">
          &larr; Volver al inicio
        </Link>
        <div className="flex items-center gap-6 mb-10">
          <Image src="/logo.png" alt="TableHive Logo" width={120} height={120} className="drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold tracking-tight">Política de Privacidad</h1>
        </div>
        
        <p className="text-foreground/60 mb-8">Última actualización: Marzo 2026</p>

        <article className="prose prose-zinc dark:prose-invert max-w-none space-y-6 text-foreground/80">
          <p>Tu privacidad es importante para nosotros. Esta Política de Privacidad explica cómo <strong>TableHive</strong> recopila, utiliza y protege tu información personal de acuerdo con las leyes de Costa Rica, de conformidad con la <em>Ley de Protección de la Persona frente al Tratamiento de sus Datos Personales (Ley No. 8968)</em> (PROHABDAT).</p>
          
          <h2 className="text-2xl font-bold mt-8 text-foreground">1. Información que Recopilamos</h2>
          <p>Solo solicitamos información personal cuando realmente la necesitamos para brindarte un servicio. La recopilamos por medios justos y legales, con tu conocimiento y consentimiento explícito. Los datos recopilados incluyen tu nombre, correo electrónico y los detalles de tu restaurante.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">2. Uso de la Información</h2>
          <p>La información recopilada se utiliza estrictamente para proporcionar, mantener y mejorar la plataforma SaaS de TableHive. No vendemos ni compartimos información personal con terceros, salvo cuando la ley lo exija.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">3. Protección de Datos (Ley 8968)</h2>
          <p>De acuerdo con PROHABDAT, tienes derecho a la autodeterminación informativa. Mantienes el derecho de acceder, rectificar, modificar o eliminar de forma segura tus datos personales en cualquier momento contactando a nuestro equipo de soporte.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">4. Seguridad y Retención</h2>
          <p>Solo retenemos los datos recopilados durante el tiempo necesario para proporcionarte tu servicio de suscripción. Protegeremos los datos que almacenamos para evitar pérdidas y robos, así como acceso no autorizado, uso o modificación.</p>

          <h2 className="text-2xl font-bold mt-8 text-foreground">5. Contáctanos</h2>
          <p>Si tienes alguna pregunta sobre cómo manejamos tus datos e información personal de acuerdo con la jurisdicción costarricense, contáctanos a legal@tablehive.cr.</p>
        </article>
      </div>
    </main>
  );
}
