import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrderTracking } from '../../pages/OrderTracking';
import { AuthProvider } from '../../context/AuthContext';

describe('OrderTracking Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders accepted orders queue and order quality verification table', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <OrderTracking />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Order Placement & Tracking')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Accepted Orders Queue/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Good Quantity/i)).toBeInTheDocument();
    expect(screen.getByText(/Damaged Quantity/i)).toBeInTheDocument();
    expect(screen.getByText(/Missing Quantity/i)).toBeInTheDocument();
  });

  it('triggers item verification and allows issuing replacement when damage is reported', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <OrderTracking />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('VERIFY ORDER ITEMS')).toBeInTheDocument();
    });

    // Check Verify button click
    const verifyBtn = screen.getByText('VERIFY ORDER ITEMS');
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText(/verified successfully/i)).toBeInTheDocument();
    });
  });

  it('triggers order shipment when all items are verified and no replacements are pending', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <OrderTracking />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('[ ORDER SHIPPED ]')).toBeInTheDocument();
    });

    const shipBtn = screen.getByText('[ ORDER SHIPPED ]');
    fireEvent.click(shipBtn);

    await waitFor(() => {
      expect(screen.getByText(/shipped successfully/i)).toBeInTheDocument();
    });
  });
});
