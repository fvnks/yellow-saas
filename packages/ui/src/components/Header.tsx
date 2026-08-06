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
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-xs lg:max-w-md">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
            aria-label="Buscar"
          />
        </div>

        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative" aria-label="Notificaciones">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-sm font-medium text-slate-600">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name || 'Usuario'}</p>
              <p className="text-[9px] text-slate-500">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95 dark:bg-slate-900 dark:border-slate-800">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={() => onNavigate?.('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Mi perfil
              </button>
              <button
                onClick={() => onNavigate?.('/settings')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <hr className="my-1 border-slate-100" />
              <button
                onClick={() => onNavigate?.('/logout')}
                className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
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