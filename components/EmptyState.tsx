import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle, action }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center py-12 px-6 animate-fade-in">
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/50 mb-4 text-slate-400 dark:text-slate-500">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-center max-w-[200px]">
          {subtitle}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
