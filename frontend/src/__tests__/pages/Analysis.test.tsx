import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Analysis } from '../../pages/Analysis';
import { AuthProvider } from '../../context/AuthContext';

describe('Analysis Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders analytics module with summary KPI charts', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Analysis />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Warehouse Analytics & Metrics')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/1. Products & Units by Category/i)).toBeInTheDocument();
      expect(screen.getByText(/2. Inventory Stock Status Distribution/i)).toBeInTheDocument();
    });
  });
});

