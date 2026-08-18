import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../pages/Dashboard';
import { AuthProvider } from '../../context/AuthContext';

describe('Dashboard Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders dashboard hub modules grid and summary statistics', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      </AuthProvider>
    );

    // Wait for metrics to load
    await waitFor(() => {
      expect(screen.getByText('Total Inventory')).toBeInTheDocument();
    });

    expect(screen.getByText('Warehouse Status')).toBeInTheDocument();
    expect(screen.getByText('Restocking')).toBeInTheDocument();
    expect(screen.getByText('Order Placement')).toBeInTheDocument();
    expect(screen.getByText('Orders Queue')).toBeInTheDocument();
    expect(screen.getByText(/Low & Out of Stock/i)).toBeInTheDocument();
    expect(screen.getByText(/Damaged & Missing/i)).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });
});

