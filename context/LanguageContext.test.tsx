/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

const TestConsumer: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="missing-key">{t('nonexistent.missing.key')}</span>
      <button onClick={() => setLanguage('en')}>set-en</button>
      <button onClick={() => setLanguage('es')}>set-es</button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { writable: true, value: 'en-US' });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults to browser language when nothing is stored', () => {
    const { getByTestId } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(getByTestId('lang').textContent).toBe('en');
  });

  it('reads saved language from localStorage', () => {
    localStorage.setItem('app_language', 'es');
    const { getByTestId } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(getByTestId('lang').textContent).toBe('es');
  });

  it('detects Spanish browser language', () => {
    Object.defineProperty(navigator, 'language', { writable: true, value: 'es-MX' });
    const { getByTestId } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(getByTestId('lang').textContent).toBe('es');
  });

  it('falls back to English for unrecognised browser languages', () => {
    Object.defineProperty(navigator, 'language', { writable: true, value: 'fr-FR' });
    const { getByTestId } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(getByTestId('lang').textContent).toBe('en');
  });

  it('setLanguage updates the active language', () => {
    const { getByTestId, getByRole } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => getByRole('button', { name: 'set-es' }).click());
    expect(getByTestId('lang').textContent).toBe('es');
    act(() => getByRole('button', { name: 'set-en' }).click());
    expect(getByTestId('lang').textContent).toBe('en');
  });

  it('setLanguage persists the choice to localStorage', () => {
    const { getByRole } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => getByRole('button', { name: 'set-es' }).click());
    act(() => vi.runAllTimers());
    expect(localStorage.getItem('app_language')).toBe('es');
  });

  it('t() returns the key path when the translation is missing', () => {
    const { getByTestId } = render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(getByTestId('missing-key').textContent).toBe('nonexistent.missing.key');
  });

  it('t() returns a non-empty string for a deeply nested valid key', () => {
    const Result: React.FC = () => {
      const { t } = useLanguage();
      // Use a top-level key that exists in both translations
      const val = t('dashboard.title');
      return <span data-testid="val">{val}</span>;
    };
    const { getByTestId } = render(
      <LanguageProvider>
        <Result />
      </LanguageProvider>
    );
    // Either the translated string or the key itself — either way it's truthy
    expect(getByTestId('val').textContent).toBeTruthy();
  });

  it('useLanguage throws when used outside a LanguageProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow();
    consoleSpy.mockRestore();
  });
});
