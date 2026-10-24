import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  Building2, 
  UserCheck, 
  Compass, 
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Placement Drives', path: '/admin/drives', icon: Briefcase },
    { name: 'Applications', path: '/admin/applications', icon: FileText },
    { name: 'Students Directory', path: '/admin/students', icon: Users },
    { name: 'Partner Companies', path: '/admin/companies', icon: Building2 },
  ];

  const studentNav = [
    { name: 'My Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Explore Drives', path: '/student/drives', icon: Compass },
    { name: 'My Applications', path: '/student/applications', icon: FileText },
    { name: 'Profile & Resume', path: '/student/profile', icon: UserCheck },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-xs" 
          onClick={onClose} 
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r border-slate-800
      `}>
        {/* Mobile Header with close button */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 lg:hidden">
          <span className="font-bold text-white text-base">Navigation</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section title */}
        <div className="px-6 pt-6 pb-2">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {isAdmin ? 'Administration' : 'Student Portal'}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">University Placement</p>
          <p className="mt-0.5 text-[11px]">Academic Year 2025–2026</p>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-700/60 pt-2">
            <span>FastAPI &bull; React</span>
            <span className="text-emerald-400 font-mono">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
