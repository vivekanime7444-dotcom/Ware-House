import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { StatCard } from '../../components/StatCard';
import { Package, ShieldAlert } from 'lucide-react';

describe('StatCard Component Tests', () => {
  it('renders title, value, and description', () => {
    render(
      <StatCard
        title="Total Products"
        value={150}
        icon={Package}
        description="Active inventory items"
      />
    );

    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('Active inventory items')).toBeInTheDocument();
  });

  it('renders with different color badge variants', () => {
    const { rerender } = render(
      <StatCard
        title="Damaged Stock"
        value="5 units"
        icon={ShieldAlert}
        color="rose"
      />
    );

    expect(screen.getByText('Damaged Stock')).toBeInTheDocument();
    expect(screen.getByText('5 units')).toBeInTheDocument();

    rerender(
      <StatCard
        title="Amber Stock"
        value={12}
        icon={ShieldAlert}
        color="amber"
      />
    );
    expect(screen.getByText('Amber Stock')).toBeInTheDocument();
  });
});
