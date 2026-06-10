import { useState, useEffect } from 'react';

export type Density = 'comfortable' | 'compact';

export function useDensity() {
  const [density, setDensity] = useState<Density>(() => {
    return (localStorage.getItem('ui-density') as Density) ?? 'comfortable';
  });

  useEffect(() => {
    localStorage.setItem('ui-density', density);
    document.documentElement.dataset.density = density;
  }, [density]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, []);

  const toggleDensity = () =>
    setDensity(d => (d === 'comfortable' ? 'compact' : 'comfortable'));

  return { density, toggleDensity, isCompact: density === 'compact' };
}
