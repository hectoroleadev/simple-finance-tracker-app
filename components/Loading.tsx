
import React from 'react';

const Loading: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center p-20 text-slate-400">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-transparent dark:border-slate-600 dark:border-t-transparent" />
  </div>
);

export default Loading;
