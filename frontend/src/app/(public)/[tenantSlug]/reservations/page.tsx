'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  branches: Array<{
    id: string;
    name: string;
    address: string;
  }>;
}

async function getRestaurantData(slug: string): Promise<RestaurantData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
    const res = await fetch(`${apiUrl}/api/restaurants/slug/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

interface ReservationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  date: string;
  time: string;
  specialRequests: string;
  branchId: string;
}

export default function RestaurantReservationsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const [tenantSlug, setTenantSlug] = useState<string>('');
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Load data on mount
  useEffect(() => {
    params.then(p => {
      setTenantSlug(p.tenantSlug);
      getRestaurantData(p.tenantSlug).then(data => {
        if (!data) notFound();
        setRestaurant(data);
        setLoading(false);
      });
    });
  }, [params]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data: ReservationFormData = {
      customerName: formData.get('customerName') as string,
      customerPhone: formData.get('customerPhone') as string,
      customerEmail: formData.get('customerEmail') as string,
      partySize: parseInt(formData.get('partySize') as string),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      specialRequests: formData.get('specialRequests') as string,
      branchId: selectedBranchId,
    };

    // Combine date and time
    const reservationTime = new Date(`${data.date}T${data.time}`);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5168";
      const res = await fetch(`${apiUrl}/api/restaurants/slug/${tenantSlug}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          partySize: data.partySize,
          reservationTime: reservationTime.toISOString(),
          branchId: data.branchId,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to submit reservation. Please try again.');
      }
    } catch (error) {
      alert('Error submitting reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!restaurant) {
    notFound();
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">Reservation Submitted!</h1>
          <p className="text-foreground/60 mb-6">
            Thank you for your reservation request. We'll contact you soon to confirm.
          </p>
          <a
            href={`/${tenantSlug}`}
            className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-4">
            Make a Reservation
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Book your table at {restaurant.name}. We look forward to serving you!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Selecciona la sucursal *
              </label>
              <select
                name="branchId"
                required
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecciona una sucursal</option>
                {restaurant.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} - {b.address}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Number of Guests *
                </label>
                <select
                  name="partySize"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5 Guests</option>
                  <option value="6">6+ Guests</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time *
                </label>
                <select
                  name="time"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select time</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="17:30">5:30 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Special Requests
              </label>
              <textarea
                name="specialRequests"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Any special requests or notes..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Request Reservation'}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-foreground/60 mb-4">
            For urgent reservations or questions, contact us directly:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {restaurant.settings.contactPhone && (
              <a
                href={`tel:${restaurant.settings.contactPhone}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                📞 Call {restaurant.settings.contactPhone}
              </a>
            )}
            {restaurant.settings.whatsAppNumber && (
              <a
                href={`https://wa.me/${restaurant.settings.whatsAppNumber.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}