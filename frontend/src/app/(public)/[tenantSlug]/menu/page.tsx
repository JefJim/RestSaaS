import Image from "next/image";
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/Button";

interface MenuData {
  id: string;
  name: string;
  categories: Array<{
    id: string;
    name: string;
    displayOrder: number;
    items: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      isAvailable: boolean;
    }>;
  }>;
}

interface RestaurantData {
  id: string;
  name: string;
  slug: string;
  settings: {
    contactEmail: string;
    contactPhone: string;
    whatsAppNumber: string;
    address: string;
    themeConfig: string;
  };
  openingHours: Array<{
    dayOfWeek: number;
    dayName: string;
    openTime: string;
    closeTime: string;
  }>;
}

async function getRestaurantData(slug: string): Promise<RestaurantData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    const res = await fetch(`${apiUrl}/api/restaurants/slug/${slug}`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getMenuData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
  const res = await fetch(`${apiUrl}/api/restaurants/slug/${slug}/menu`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const [restaurant, menu] = await Promise.all([
    getRestaurantData(tenantSlug),
    getMenuData(tenantSlug)
  ]);

  if (!restaurant || !menu) {
    notFound();
  }

  const isOpen = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = restaurant.openingHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!todayHours) return false;

    const openTime = parseTime(todayHours.openTime);
    const closeTime = parseTime(todayHours.closeTime);

    return currentTime >= openTime && currentTime <= closeTime;
  };

  const parseTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans pb-24 selection:bg-primary/30">
      {/* Dynamic Header */}
      <div className="relative h-[35vh] md:h-[45vh] w-full bg-surface-dark overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-80 z-0"></div>

        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-secondary rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>

        <div className="relative z-20 w-full max-w-5xl mx-auto px-6 pb-12">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 backdrop-blur-md border border-white/20 ${
            isOpen()
              ? 'bg-green-500/20 text-green-100'
              : 'bg-red-500/20 text-red-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isOpen() ? 'bg-green-400' : 'bg-red-400'
            } animate-pulse`}></span>
            {isOpen() ? 'Abierto' : 'Cerrado'}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white capitalize tracking-tighter shadow-sm">
            {restaurant.name}
          </h1>
          <p className="text-white/80 mt-2 text-lg md:text-xl font-medium max-w-xl">
            {restaurant.slug === 'pizzaluna' ? 'Las mejores pizzas artesanales de la zona.' : 'Experiencia culinaria de excelencia.'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-30">

        {/* Category Navigation */}
        <div className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar">
          {menu.categories.map((cat: any, i: number) => (
            <button
              key={cat.id}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm
                ${i === 0
                  ? 'bg-foreground text-background hover:scale-105'
                  : 'glass text-foreground hover:bg-white/40 dark:hover:bg-white/10'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {menu.categories.map((category: any) => (
          <div key={category.id} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-foreground">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((item: any) => (
                <div key={item.id} className="group glass rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col dark:glass-dark">
                  <div className="h-48 bg-zinc-200 dark:bg-zinc-800 relative overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-300 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700"></div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold tracking-tight">{item.name}</h3>
                      <span className="text-lg font-bold text-primary">₡{item.price.toLocaleString()}</span>
                    </div>
                    <p className="text-foreground/60 text-sm leading-relaxed mb-6 flex-1">
                      {item.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Agregar al Pedido
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {menu.categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60">Menú próximamente...</p>
          </div>
        )}
      </div>

      {/* Floating Action Button for WhatsApp Order */}
      <a 
        href={`https://wa.me/${restaurant.settings.whatsAppNumber}?text=Hola, me gustaría hacer un pedido.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 animate-bounce hover:animate-none"
        title="Ordenar por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>
    </main>
  );
}
