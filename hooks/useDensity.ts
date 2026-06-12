import { useState, useEffect, useRef } from 'react';
import { debounce } from '../utils/debounce';

export type Density = 'comfortable' | 'compact';

export function useDensity() {
  const [density, setDensity] = useState<Density>(() => {
    return (localStorage.getItem('ui-density') as Density) ?? 'comfortable';
  });
  const debouncedSaveRef = useRef(debounce((d: Density) => {
    localStorage.setItem('ui-density', d);
  }, 500));

  useEffect(() => {
    debouncedSaveRef.current(density);
    document.documentElement.dataset.density = density;
  }, [density]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, []);

  const toggleDensity = () => setDensity((d) => (d === 'comfortable' ? 'compact' : 'comfortable'));

  return { density, toggleDensity, isCompact: density === 'compact' };
}
