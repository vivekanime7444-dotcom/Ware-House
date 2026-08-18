import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { OrderPlacement } from '../../pages/OrderPlacement';
import { AuthProvider } from '../../context/AuthContext';

describe('OrderPlacement Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders order placement module with product selection and direct numerical quantity input', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <OrderPlacement />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Order Placement Module')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Wireless Ergonomic Mouse')).toBeInTheDocument();
    });

    // Enter desired numerical quantity directly
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
    fireEvent.change(inputs[0], { target: { value: '3' } });

    // Click Place Order on the product card
    const placeButtons = screen.getAllByRole('button', { name: /PLACE ORDER/i });
    expect(placeButtons.length).toBeGreaterThan(0);
    fireEvent.click(placeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/placed successfully/i)).toBeInTheDocument();
    });
  });
});

