import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Menu, ShieldCheck, GraduationCap } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm shadow-indigo-200">
            {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-slate-800 leading-tight">CareerConnect</h1>
            <p className="text-[11px] text-slate-500 font-medium">Placement Management System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Badge */}
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {user?.role}
        </span>

        {/* User Info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
