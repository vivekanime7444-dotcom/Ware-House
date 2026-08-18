import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DamagedMissing } from '../../pages/DamagedMissing';
import { AuthProvider } from '../../context/AuthContext';

describe('DamagedMissing Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders metric cards, verification issue records, and status filters', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <DamagedMissing />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Damaged & Missing Module')).toBeInTheDocument();
    expect(screen.getByText('Total Damaged Items')).toBeInTheDocument();
    expect(screen.getByText('Total Missing Items')).toBeInTheDocument();
    expect(screen.getByText('Total Affected Items')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Verification Issue Records/i)).toBeInTheDocument();
    });
  });

  it('switches between status filter tabs (All, Pending, Replaced)', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <DamagedMissing />
        </BrowserRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/All \(/i)).toBeInTheDocument();
    });

    const pendingPill = screen.getByText(/Pending \(/i);
    fireEvent.click(pendingPill);

    const replacedPill = screen.getByText(/Replaced \(/i);
    fireEvent.click(replacedPill);
  });

  it('allows clicking quick replace button on pending issue cards', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <DamagedMissing />
        </BrowserRouter>
      </AuthProvider>
    );

    const replaceBtn = await screen.findByRole('button', { name: /Replace \(/i });
    expect(replaceBtn).toBeInTheDocument();
    fireEvent.click(replaceBtn);

    expect(await screen.findByText(/Successfully replaced/i)).toBeInTheDocument();
  });
});



