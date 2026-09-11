import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, PhoneCall, User, LogOut, Globe, Wrench, LayoutDashboard } from 'lucide-react';
import { UserRole } from '@shared';

export const Navbar: React.FC = () => {
  const { user, logout, setLanguage } = useAuthStore();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLangToggle = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(nextLang);
    setLanguage(nextLang);
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.FEDERATION_ADMIN:
      case UserRole.SOCIETY_ADMIN:
        return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-semibold">Cooperative Admin</span>;
      case UserRole.WORKER:
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-semibold">Verified Worker</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-semibold">Customer</span>;
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === UserRole.WORKER) return '/worker/dashboard';
    if ([UserRole.SUPER_ADMIN, UserRole.FEDERATION_ADMIN, UserRole.SOCIETY_ADMIN].includes(user.role)) return '/admin/dashboard';
    return '/customer/bookings';
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coop-700 to-coop-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight block">CoopLabour</span>
            <span className="text-[10px] text-coop-600 font-semibold tracking-wider uppercase block -mt-1">Verified Marketplace</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/services" className="text-slate-600 hover:text-coop-600 font-medium transition-colors text-sm flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-coop-500" />
            {t('nav.services')}
          </Link>
          <Link to="/emergency" className="text-red-600 hover:text-red-700 font-semibold transition-colors text-sm flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 animate-pulse">
            <PhoneCall className="w-4 h-4 text-red-500" />
            {t('nav.emergency')}
          </Link>
        </nav>

        {/* Right Section / Controls */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher Button */}
          <button
            onClick={handleLangToggle}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Toggle Language (English / हिन्दी)"
          >
            <Globe className="w-3.5 h-3.5 text-coop-600" />
            <span>{i18n.language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to={getDashboardPath()}
                className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-coop-600" />
                <span className="hidden sm:inline">{user.name}</span>
                {getRoleBadge(user.role)}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-slate-700 hover:text-coop-700 font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="bg-coop-600 hover:bg-coop-700 text-white font-medium text-sm px-4 py-1.5 rounded-lg shadow-sm hover:shadow transition-all"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
