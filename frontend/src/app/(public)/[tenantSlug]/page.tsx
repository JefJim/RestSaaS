import { notFound } from 'next/navigation';
import Link from 'next/link';

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

async function getRestaurantData(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    const res = await fetch(`${apiUrl}/api/public/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function RestaurantLandingPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const data = await getRestaurantData(tenantSlug);

  if (!data || !data.restaurant) {
    notFound();
  }

  const restaurant = data.restaurant;

  const isOpen = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="mb-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            isOpen()
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isOpen() ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}></span>
            {isOpen() ? 'Open Now' : 'Closed'}
          </div>
        </div>

        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 capitalize">
          {restaurant.name}
        </h1>

        <p className="text-xl text-gray-500 mb-8">
          Welcome to our official website! Our digital menu and reservation system are powered by the SaaS platform.
        </p>

        <div className="flex gap-4 justify-center mb-8">
          <Link
            href={`/${tenantSlug}/menu`}
            className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Ver Menú
          </Link>
          <Link
            href={`/${tenantSlug}/reservations`}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Reservar Mesa
          </Link>
        </div>

        {restaurant.description && (
          <div className="text-gray-600 mb-4 max-w-lg mx-auto">
            <p>{restaurant.description}</p>
          </div>
        )}
      </div>
    </main>
  );
}
