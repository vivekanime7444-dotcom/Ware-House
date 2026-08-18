import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StockBadge } from '../../components/StockBadge';

describe('StockBadge Component Tests', () => {
  it('renders IN STOCK badge with emerald styling', () => {
    render(<StockBadge status="IN STOCK" />);
    expect(screen.getByText('IN STOCK')).toBeInTheDocument();
  });

  it('renders LOW STOCK badge with amber styling', () => {
    render(<StockBadge status="LOW STOCK" />);
    expect(screen.getByText('LOW STOCK')).toBeInTheDocument();
  });

  it('renders OUT OF STOCK badge with rose styling', () => {
    render(<StockBadge status="OUT OF STOCK" />);
    expect(screen.getByText('OUT OF STOCK')).toBeInTheDocument();
  });

  it('renders with small size variant', () => {
    render(<StockBadge status="IN STOCK" size="sm" />);
    expect(screen.getByText('IN STOCK')).toBeInTheDocument();
  });
});
