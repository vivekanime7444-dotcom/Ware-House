import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { AuthProvider } from '../../context/AuthContext';

describe('Navbar Component Tests', () => {
  it('renders brand title and user avatar badge', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText(/StockFlow WMS/i)).toBeInTheDocument();
  });
});
