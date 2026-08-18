import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Inventory } from '../../pages/Inventory';
import { AuthProvider } from '../../context/AuthContext';

describe('Inventory Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders active available stock view with category filter and product cards', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </AuthProvider>
    );

    // Verify title and banner
    expect(screen.getByText('Central Inventory Module')).toBeInTheDocument();
    expect(screen.getByText('Active Available Stock View')).toBeInTheDocument();

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('All Categories')).toBeInTheDocument();
      expect(screen.getByText('Available SKUs')).toBeInTheDocument();
    });

    // Check category buttons and click Electronics
    const electronicsPill = await screen.findByRole('button', { name: 'Electronics' });
    expect(electronicsPill).toBeInTheDocument();

    // Filter by Electronics
    fireEvent.click(electronicsPill);
    await waitFor(() => {
      expect(screen.getByText('USB-C Cable 2m')).toBeInTheDocument();
    });
  });


  it('supports search filtering across product titles and codes', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </AuthProvider>
    );

    const searchInput = await screen.findByPlaceholderText(/Search product code/i);
    fireEvent.change(searchInput, { target: { value: 'Wireless Ergonomic Mouse' } });

    await waitFor(() => {
      expect(screen.getByText('Wireless Ergonomic Mouse')).toBeInTheDocument();
    });
  });
});
