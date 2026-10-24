import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo' }) {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50/70',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/70',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    blue: {
      bg: 'bg-blue-50/70',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${scheme.bg} ${scheme.text} ${scheme.border} border`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
