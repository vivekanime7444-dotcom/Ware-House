import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { AuthProvider } from '../../context/AuthContext';

describe('Sidebar Component Tests', () => {
  it('renders all module navigation links', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Warehouse Status')).toBeInTheDocument();
    expect(screen.getByText('Restocking')).toBeInTheDocument();
    expect(screen.getByText('Order Placement')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Damaged & Missing')).toBeInTheDocument();
    expect(screen.getByText('Low Stock & Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Analysis')).toBeInTheDocument();
  });
});
