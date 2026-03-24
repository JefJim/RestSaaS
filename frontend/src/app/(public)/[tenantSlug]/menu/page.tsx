import Image from "next/image";
import { notFound } from 'next/navigation';
import { Button } from "@/components/ui/Button";
import { PublicMenu } from "@/features/menu/components/PublicMenu";

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

async function getPublicData(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    const res = await fetch(`${apiUrl}/api/public/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function RestaurantMenuPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const data = await getPublicData(tenantSlug);

  if (!data || !data.restaurant || !data.menu) {
    notFound();
  }

  const { restaurant, menu } = data;

  const isOpen = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = restaurant.openingHours?.find((h: any) => h.dayOfWeek === dayOfWeek);
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

        {/* Menu Content (Interactive) */}
        <PublicMenu restaurant={restaurant} menu={menu} />

        {menu.categories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-foreground/60">Menú próximamente...</p>
          </div>
        )}
      </div>
    </main>
  );
}
