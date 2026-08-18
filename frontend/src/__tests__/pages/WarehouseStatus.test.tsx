import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WarehouseStatus } from '../../pages/WarehouseStatus';
import { AuthProvider } from '../../context/AuthContext';

describe('WarehouseStatus Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders warehouse catalog grid with Add Product button and KPI headers', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <WarehouseStatus />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Warehouse Status Module')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Product/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Total Warehouse Units/i)).toBeInTheDocument();
    });
  });

  it('opens and submits Add Product modal form', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <WarehouseStatus />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Total Warehouse Units/i)).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add Product/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Add New Product to Warehouse')).toBeInTheDocument();

    // Fill form fields
    fireEvent.change(screen.getByPlaceholderText('e.g. WHS-101'), { target: { value: 'NEW-TEST-SKU' } });
    fireEvent.change(screen.getByPlaceholderText('Enter product title'), { target: { value: 'New Test Smart Device' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Save Product/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('New Test Smart Device')).toBeInTheDocument();
    }, { timeout: 4000 });
  });


  it('allows deleting a product for low demand items', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <WarehouseStatus />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('USB-C Cable 2m')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /Delete Product/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmBtn = await screen.findByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/has been removed from warehouse/i)).toBeInTheDocument();
    });
  });
});

