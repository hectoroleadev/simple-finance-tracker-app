import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeOrder: Record<string, number> = {
  '/dashboard': 0,
  '/history': 1,
  '/charts': 2,
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const prevOrderRef = useRef<number>(routeOrder[location.pathname] ?? 0);

  const current = routeOrder[location.pathname] ?? 0;
  const prev = prevOrderRef.current;
  const animClass =
    current > prev ? 'page-slide-right' : current < prev ? 'page-slide-left' : 'page-fade';

  useEffect(() => {
    prevOrderRef.current = routeOrder[location.pathname] ?? 0;
  }, [location.pathname]);

  return (
    <div key={location.pathname} className={animClass}>
      {children}
    </div>
  );
};

export default PageTransition;
