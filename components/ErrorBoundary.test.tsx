/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// A component that throws on demand via a module-level flag
let forceThrow = false;

const ControlledError: React.FC = () => {
  if (forceThrow) throw new Error('Controlled test error');
  return <div>Healthy content</div>;
};

describe('ErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    forceThrow = false;
    // React emits console.error for error boundaries in test environments
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ControlledError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Healthy content')).toBeTruthy();
  });

  it('renders the error UI when a child throws', () => {
    forceThrow = true;
    render(
      <ErrorBoundary>
        <ControlledError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeTruthy();
    expect(screen.getByText('Controlled test error')).toBeTruthy();
  });

  it('renders a custom fallback when the fallback prop is provided', () => {
    forceThrow = true;
    render(
      <ErrorBoundary fallback={<div>Custom fallback UI</div>}>
        <ControlledError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom fallback UI')).toBeTruthy();
  });

  it('shows a generic message when the error has no message', () => {
    const Silent: React.FC = () => {
      throw new Error('');
    };
    render(
      <ErrorBoundary>
        <Silent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Ha ocurrido un error inesperado.')).toBeTruthy();
  });

  it('resets error state and re-renders children on "Intentar de nuevo"', () => {
    forceThrow = true;
    render(
      <ErrorBoundary>
        <ControlledError />
      </ErrorBoundary>
    );
    expect(screen.getByText('Algo salió mal')).toBeTruthy();

    // Allow the child to succeed on the next render
    forceThrow = false;
    act(() => {
      screen.getByRole('button', { name: 'Intentar de nuevo' }).click();
    });

    expect(screen.getByText('Healthy content')).toBeTruthy();
  });

  it('calls console.error when an error is caught', () => {
    forceThrow = true;
    render(
      <ErrorBoundary>
        <ControlledError />
      </ErrorBoundary>
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
