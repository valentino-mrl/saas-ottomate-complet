import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/app/leads', label: 'Leads', icon: UserGroupIcon },
  { to: '/app/mail-templates', label: 'Templates Mail', icon: EnvelopeIcon, withClientId: true },
  { to: '/app/campaigns', label: 'Campagnes', icon: MegaphoneIcon, withClientId: true },
  { to: '/app/voice-bot', label: 'Voice Bot', icon: PhoneIcon },
  { to: '/app/receptionist', label: 'Réceptionniste', icon: UserIcon },
  { to: '/app/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/app/billing', label: 'Billing', icon: CreditCardIcon },
];

export default function AppLayout() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const clientId = user?.id;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (email: string, name?: string) => {
    if (name) return name.charAt(0).toUpperCase();
    return email.charAt(0).toUpperCase();
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    const segments: { label: string; path?: string }[] = [];
    if (path.startsWith('/admin')) {
      segments.push({ label: 'Admin' });
      segments.push({ label: 'Configuration N8N' });
    } else {
      segments.push({ label: 'App', path: '/app' });
      const sub = path.replace('/app/', '').replace('/app', '');
      if (sub === '' || sub === '/') {
        segments.push({ label: 'Dashboard' });
      } else {
        const labels: Record<string, string> = {
          leads: 'Leads',
          'mail-templates': 'Templates Mail',
          campaigns: 'Campagnes',
          'voice-bot': 'Voice Bot',
          receptionist: 'Réceptionniste',
          analytics: 'Analytics',
          billing: 'Billing',
        };
        segments.push({ label: labels[sub] || sub });
      }
    }
    return segments;
  };

  const buildLink = (item: typeof navItems[0]) => {
    if (item.withClientId && clientId) {
      return `${item.to}?clientId=${clientId}`;
    }
    return item.to;
  };

  const breadcrumbs = getBreadcrumb();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar-bg">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        <span className="text-lg font-bold gradient-text">Ottomate</span>
      </div>

      <Separator className="bg-border" />

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={buildLink(item)}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <Separator className="my-2 bg-border" />
              <NavLink
                to="/admin"
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`
                }
              >
                <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
                Admin
              </NavLink>
            </>
          )}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-3 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/20 text-primary text-sm">
                  {getInitials(user?.email || '', user?.full_name || undefined)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.full_name || 'Utilisateur'}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card-bg border-border">
            <DropdownMenuItem className="text-text-secondary">
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem className="text-text-secondary">
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-danger focus:text-danger"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-[260px] lg:flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 flex items-center gap-4 px-4 lg:px-6 border-b border-border bg-background/80 backdrop-blur-sm flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRightIcon className="w-3 h-3 text-text-muted" />}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? 'text-text-primary font-medium'
                      : 'text-text-muted'
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Plan badge */}
          <Badge variant="outline" className="border-primary/30 text-primary">
            {profile?.plan || 'Free'}
          </Badge>

          {/* Avatar */}
          <Avatar className="h-8 w-8 hidden sm:flex">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {getInitials(user?.email || '', user?.full_name || undefined)}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
