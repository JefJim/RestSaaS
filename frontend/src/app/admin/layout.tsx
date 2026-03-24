export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-emerald-600">SaaS Admin</h2>
          <p className="text-sm text-gray-500">Restaurant Portal</p>
        </div>
        <nav className="mt-6">
          <a href="/admin" className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 font-medium">Dashboard</a>
          <a href="/admin/menu" className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 font-medium">Menu Manager</a>
          <a href="/admin/reservations" className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 font-medium">Reservations</a>
          <a href="/admin/settings" className="block px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 font-medium">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-12">
        {children}
      </main>
    </div>
  );
}
