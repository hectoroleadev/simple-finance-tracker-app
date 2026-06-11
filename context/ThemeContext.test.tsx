/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

const mockMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: prefersDark && query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

const TestConsumer: React.FC = () => {
  const { state, dispatch } = useTheme();
  return (
    <div>
      <span data-testid="theme">{state.theme}</span>
      <button onClick={() => dispatch({ type: 'TOGGLE_THEME' })}>toggle</button>
      <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'dark' })}>set-dark</button>
      <button onClick={() => dispatch({ type: 'SET_THEME', payload: 'light' })}>set-light</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('defaults to light theme when no preference is stored', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('theme').textContent).toBe('light');
  });

  it('reads saved theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('theme').textContent).toBe('dark');
  });

  it('detects system dark-mode preference when nothing is saved', () => {
    mockMatchMedia(true);
    const { getByTestId } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('theme').textContent).toBe('dark');
  });

  it('toggles between light and dark', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(getByTestId('theme').textContent).toBe('light');
    act(() => getByRole('button', { name: 'toggle' }).click());
    expect(getByTestId('theme').textContent).toBe('dark');
    act(() => getByRole('button', { name: 'toggle' }).click());
    expect(getByTestId('theme').textContent).toBe('light');
  });

  it('sets theme via SET_THEME action', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => getByRole('button', { name: 'set-dark' }).click());
    expect(getByTestId('theme').textContent).toBe('dark');
    act(() => getByRole('button', { name: 'set-light' }).click());
    expect(getByTestId('theme').textContent).toBe('light');
  });

  it('persists theme to localStorage on change', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => getByRole('button', { name: 'set-dark' }).click());
    expect(localStorage.getItem('theme')).toBe('dark');
    act(() => getByRole('button', { name: 'set-light' }).click());
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('adds dark class to document root when dark theme is active', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    act(() => getByRole('button', { name: 'set-dark' }).click());
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document root when switching to light', () => {
    localStorage.setItem('theme', 'dark');
    const { getByRole } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    act(() => getByRole('button', { name: 'set-light' }).click());
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('useTheme throws when used outside a ThemeProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleSpy.mockRestore();
  });
});
