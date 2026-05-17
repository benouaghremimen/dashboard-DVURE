import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Home,
  Calendar,
  Clock,
  Users,
  LogOut,
  Building,
  KeyRound
} from 'lucide-react';
const insatImage = '/bg-insat.png';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = String(user?.role || '').toUpperCase() === 'ADMIN';

  const menuItems = isAdmin
    ? [
      { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Building, label: 'Salles', path: '/admin/rooms' },
      { icon: Calendar, label: 'Réservations', path: '/admin/reservations' },
      { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
      { icon: KeyRound, label: 'Mot de passe', path: '/change-password' },
    ]
    : [
      { icon: Home, label: 'Dashboard', path: '/club/dashboard' },
      { icon: Calendar, label: 'Calendrier', path: '/club/calendar' },
      { icon: Clock, label: 'Mes demandes', path: '/club/requests' },
      { icon: KeyRound, label: 'Mot de passe', path: '/change-password' },
    ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar with background image */}
      <aside className="fixed left-0 top-0 h-full w-64 text-white flex flex-col shadow-xl z-10">
        {/* Background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${insatImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/95 via-red-800/90 to-red-900/95"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="p-6 border-b border-red-700/50">
            <h1 className="text-2xl font-bold">INSAT</h1>
            <p className="text-sm text-red-100 mt-1">Gestion des Salles</p>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-800/50 transition-colors text-left backdrop-blur-sm"
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-red-700/50">
            <div className="mb-4 p-3 bg-red-800/30 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-red-100">{isAdmin ? 'Administrateur' : 'Club'}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="w-full bg-red-800/50 hover:bg-red-700/50 text-white backdrop-blur-sm"
            >
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top bar with notifications */}
        <header className="sticky top-0 bg-white shadow-sm z-20 border-b border-gray-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isAdmin ? 'Administration' : user?.email || 'Club'}
              </h2>
              <p className="text-sm text-gray-600">
                Bienvenue, {user?.email}
              </p>
            </div>
            {!isAdmin && <NotificationDropdown />}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

