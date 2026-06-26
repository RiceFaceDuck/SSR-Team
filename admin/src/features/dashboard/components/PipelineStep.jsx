import React from 'react';

const themeStyles = {
  blue: {
    active: 'bg-blue-50 border-2 border-blue-200 shadow-md transform scale-[1.02]',
    icon: 'bg-blue-600 text-white',
    badge: 'bg-blue-100 text-blue-700',
  },
  rose: {
    active: 'bg-rose-50 border-2 border-rose-200 shadow-md transform scale-[1.02]',
    icon: 'bg-rose-600 text-white',
    badge: 'bg-rose-100 text-rose-700',
  },
  amber: {
    active: 'bg-amber-50 border border-amber-200 hover:shadow-md',
    icon: 'bg-amber-500 text-white',
    badge: 'bg-amber-100 text-amber-700',
  },
  emerald: {
    active: 'bg-emerald-50 border-2 border-emerald-300 shadow-md transform scale-[1.02]',
    icon: 'bg-emerald-600 text-white',
    badge: 'bg-emerald-100 text-emerald-700',
  },
};

export default function PipelineStep({
  icon: Icon,
  title,
  description,
  isActive,
  theme = 'blue',
  children,
}) {
  const styles = themeStyles[theme];

  return (
    <div
      className={`relative flex flex-col md:flex-row items-center md:items-start gap-4 p-4 rounded-2xl transition-all ${isActive ? styles.active : 'opacity-60 grayscale'}`}
    >
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ${isActive ? styles.icon : 'bg-slate-200 text-slate-500'}`}
      >
        <Icon size={28} />
      </div>
      <div className="text-center md:text-left flex-1">
        <h3 className="font-black text-lg text-slate-800">{title}</h3>
        <p
          className="text-sm font-medium text-slate-600 mt-1"
          dangerouslySetInnerHTML={{ __html: description }}
        ></p>
      </div>
      {isActive && children && (
        <div className="md:self-center shrink-0 flex flex-col gap-2">{children}</div>
      )}
    </div>
  );
}
