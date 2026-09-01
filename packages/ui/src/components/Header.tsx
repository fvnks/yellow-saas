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
    <header className="h-16 bg-white border-b border-[#E2E8F0] fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6 dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-xl font-bold text-foreground dark:text-white truncate max-w-xs lg:max-w-md">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-64 pl-10 pr-4 py-2 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:placeholder-slate-400"
            aria-label="Buscar"
          />
        </div>

        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors relative" aria-label="Notificaciones">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FACC15] rounded-full" />
        </button>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-xl transition-colors"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-sm font-medium text-muted-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground dark:text-white">{user?.name || 'Usuario'}</p>
              <p className="text-[9px] text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-2xl shadow-lg py-1 z-50 animate-in fade-in-0 zoom-in-95 dark:bg-slate-900 dark:border-slate-800">
              <div className="px-4 py-3 border-b border-[#E2E8F0]">
                <p className="text-sm font-medium text-foreground dark:text-white">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => onNavigate?.('/profile')}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Mi perfil
              </button>
              <button
                onClick={() => onNavigate?.('/settings')}
                className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </button>
              <hr className="my-1 border-[#E2E8F0]" />
              <button
                onClick={() => onNavigate?.('/logout')}
                className="w-full px-4 py-2 text-left text-sm text-[#FACC15] hover:bg-rose-50 transition-colors flex items-center gap-2"
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