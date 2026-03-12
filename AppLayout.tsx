// src/components/AppLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  ChartBarIcon,
  MegaphoneIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, signOut, isAdmin } = useAuth();

  // ✅ Client id (multi-tenant) : on l’utilise pour construire les liens Mailing Templates / Campaigns
  // ⚠️ IMPORTANT : adapte cette ligne si ton id est ailleurs (ex: user.profile.id)
  const clientId = String(user?.id || user?.profile?.id || '');

  const baseNavigation = [
    { name: 'Dashboard', href: '/app', icon: HomeIcon },
    { name: 'Leads', href: '/app/leads', icon: UserGroupIcon },

    // ✅ on passe le clientId en query string (route actuelle ne contient pas :id)
    {
      name: 'Mailing Templates',
      href: clientId ? `/app/mail-templates?clientId=${encodeURIComponent(clientId)}` : '/app/mail-templates',
      icon: EnvelopeIcon,
    },

    { name: 'Voice Bot', href: '/app/voice-bot', icon: PhoneIcon },
    { name: 'Receptionist', href: '/app/receptionist', icon: UserIcon },
    { name: 'Analytics', href: '/app/analytics', icon: ChartBarIcon },

    {
      name: 'Campaigns',
      href: clientId ? `/app/campaigns?clientId=${encodeURIComponent(clientId)}` : '/app/campaigns',
      icon: MegaphoneIcon,
    },

    { name: 'Billing', href: '/app/billing', icon: CreditCardIcon },
  ];

  // 👇 construit la liste finale du menu (avec Admin si isAdmin = true)
  const navItems = isAdmin
    ? [
        ...baseNavigation,
        {
          name: 'Admin',
          href: '/admin',
          icon: Cog6ToothIcon,
        },
      ]
    : baseNavigation;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-blue-600">Ottomate</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.full_name || (user as any)?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {/* debug optionnel */}
                  {clientId ? (
                    <p className="text-[10px] text-gray-400 mt-1">clientId: {clientId}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
