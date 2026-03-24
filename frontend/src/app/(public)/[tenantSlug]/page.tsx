import { notFound } from 'next/navigation';

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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/tenant/${slug}`, {
      cache: 'no-store' // For development, in production use ISR
    });
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
  const restaurant = await getRestaurantData(tenantSlug);

  if (!restaurant) {
    notFound();
  }

  const isOpen = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
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
          <a
            href={`/${tenantSlug}/menu`}
            className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            View Menu
          </a>
          <a
            href={`/${tenantSlug}/reservations`}
            className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
          >
            Book a Table
          </a>
        </div>

        {restaurant.settings.address && (
          <div className="text-gray-600 mb-4">
            <p className="font-medium">📍 {restaurant.settings.address}</p>
          </div>
        )}

        {restaurant.settings.contactPhone && (
          <div className="text-gray-600">
            <p>📞 {restaurant.settings.contactPhone}</p>
          </div>
        )}
      </div>
    </main>
  );
}
