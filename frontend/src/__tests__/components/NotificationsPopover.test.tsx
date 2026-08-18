import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationsPopover } from '../../components/NotificationsPopover';
import { AuthProvider } from '../../context/AuthContext';

describe('NotificationsPopover Component Tests', () => {
  it('renders notification bell icon and opens notification drawer upon click', async () => {
    render(
      <AuthProvider>
        <NotificationsPopover />
      </AuthProvider>
    );

    const bellBtn = screen.getByRole('button');
    expect(bellBtn).toBeInTheDocument();

    fireEvent.click(bellBtn);

    await waitFor(() => {
      expect(screen.getByText(/Stock Alerts \(/i)).toBeInTheDocument();
    });
  });
});


