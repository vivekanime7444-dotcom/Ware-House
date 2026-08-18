import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Restocking } from '../../pages/Restocking';
import { AuthProvider } from '../../context/AuthContext';

describe('Restocking Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders restocking module with product catalog and restock transaction table', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Restocking />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Restocking & Replenishment')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Stock Replenishment Workflow')).toBeInTheDocument();
      expect(screen.getByText('Restocking Audit History')).toBeInTheDocument();
    });
  });

  it('allows entering restock quantity and submitting stock replenishment', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Restocking />
        </BrowserRouter>
      </AuthProvider>
    );

    const qtyInput = await screen.findByRole('spinbutton');
    fireEvent.change(qtyInput, { target: { value: '25' } });

    // Submit restock with button
    const restockBtn = await screen.findByRole('button', { name: /RESTOCK/i });
    fireEvent.click(restockBtn);

    await waitFor(() => {
      expect(screen.getByText(/Successfully added/i)).toBeInTheDocument();
    });
  });
});


