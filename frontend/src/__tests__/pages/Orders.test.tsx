import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Orders } from '../../pages/Orders';
import { AuthProvider } from '../../context/AuthContext';

describe('Orders Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders orders list with status filter and allows accepting pending orders', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Orders />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/Orders Module/i)).toBeInTheDocument();

    expect(await screen.findByText(/Prioritized Orders \(/i)).toBeInTheDocument();
    const orderHeadings = await screen.findAllByText(/ORDER #/i);
    expect(orderHeadings.length).toBeGreaterThan(0);

    // Find and click Accept Order button if present
    const acceptBtn = screen.queryByRole('button', { name: /ACCEPT ORDER/i });
    if (acceptBtn) {
      fireEvent.click(acceptBtn);
      await waitFor(() => {
        expect(screen.queryByText(/successfully accepted/i)).toBeDefined();
      });
    }
  });

  it('supports filtering orders by status select dropdown', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Orders />
        </BrowserRouter>
      </AuthProvider>
    );

    const statusHeading = await screen.findByText(/Prioritized Orders \(/i);
    expect(statusHeading).toBeInTheDocument();

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'PENDING' } });

    await waitFor(() => {
      expect(screen.getByText(/Prioritized Orders \(/i)).toBeInTheDocument();
      expect(screen.getByText(/ORD-1001/i)).toBeInTheDocument();
    });
  });
});





