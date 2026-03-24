export default function RestaurantLandingPage({ params }: { params: { tenantSlug: string } }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 capitalize">{params.tenantSlug}</h1>
        <p className="text-xl text-gray-500 mb-8">
          Welcome to our official website! Our digital menu and reservation system are powered by the SaaS platform.
        </p>
        <div className="flex gap-4 justify-center">
          <a href={`/menu`} className="px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
            View Menu
          </a>
          <a href={`/reservations`} className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
            Book a Table
          </a>
        </div>
      </div>
    </main>
  );
}
