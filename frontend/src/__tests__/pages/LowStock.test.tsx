import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LowStock } from '../../pages/LowStock';
import { AuthProvider } from '../../context/AuthContext';

describe('LowStock Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders low stock & out of stock monitoring module with alert metrics', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <LowStock />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Low Stock & Out of Stock Module')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/LOW STOCK \(/i)).toBeInTheDocument();
      expect(screen.getByText(/OUT OF STOCK \(/i)).toBeInTheDocument();
    });
  });
});

