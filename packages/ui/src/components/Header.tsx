import { Bell, Search, Menu, User, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  user?: { name: string; email: string; avatar?: string };
  onNavigate?: (path: string) => void;
}

export function Header({ title, onMenuClick, user, onNavigate }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-snow border-b border-mist fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-iron hover:text-ink hover:bg-cloud rounded-md transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-bold text-ink truncate max-w-xs lg:max-w-md">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-iron" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-64 pl-10 pr-4 py-2 bg-cloud border border-mist rounded-md text-sm text-ink placeholder-iron focus:outline-none focus:ring-2 focus:ring-monday-violet/20 focus:border-monday-violet transition-colors"
            aria-label="Buscar"
          />
        </div>

        <button className="p-2 text-iron hover:text-ink hover:bg-cloud rounded-md transition-colors relative" aria-label="Notificaciones">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-monday-violet rounded-full" />
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-cloud rounded-md transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-monday-violet/10 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-sm font-medium text-monday-violet">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-ink">{user?.name || 'Usuario'}</p>
              <p className="text-[9px] text-iron">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-iron" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-snow border border-mist rounded-2xl shadow-xl py-1 z-50 animate-in fade-in-0 zoom-in-95">
              <div className="px-4 py-3 border-b border-mist">
                <p className="text-sm font-medium text-ink">{user?.name}</p>
                <p className="text-xs text-iron">{user?.email}</p>
              </div>
              <button
                onClick={() => onNavigate?.('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-cloud transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Mi perfil
              </button>
              <button
                onClick={() => onNavigate?.('/settings')}
                className="w-full px-4 py-2 text-left text-sm text-ink hover:bg-cloud transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <hr className="my-1 border-mist" />
              <button
                onClick={() => onNavigate?.('/logout')}
                className="w-full px-4 py-2 text-left text-sm text-monday-violet hover:bg-monday-violet/5 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
