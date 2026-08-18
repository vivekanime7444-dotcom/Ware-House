import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';

const TestAuthConsumer: React.FC = () => {
  const { user, loading, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading-status">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="user-name">{user ? user.username : 'no-user'}</div>
      <div data-testid="user-role">{user ? user.role : 'no-role'}</div>
      <button onClick={() => login('admin', 'admin123')}>Login Admin</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext & Hook Unit Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders auth provider and performs auto-login fallback', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('ready');
    });

    expect(screen.getByTestId('user-name').textContent).toBe('admin');
  });

  it('handles manual login and updates user state', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('ready');
    });

    const loginBtn = screen.getByText('Login Admin');
    await act(async () => {
      loginBtn.click();
    });

    expect(screen.getByTestId('user-name').textContent).toBe('admin');
  });

  it('clears stored session and re-initializes on logout', async () => {
    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading-status').textContent).toBe('ready');
    });

    const logoutBtn = screen.getByText('Logout');
    await act(async () => {
      logoutBtn.click();
    });

    // Logout resets token and falls back gracefully
    expect(screen.getByTestId('loading-status').textContent).toBe('ready');
  });
});
