import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriorityBadge } from '../../components/PriorityBadge';

describe('PriorityBadge Component Tests', () => {
  it('renders High Priority badge when ratio is 1.0', () => {
    render(<PriorityBadge ratio={1.0} label="High Priority" />);
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('renders Medium Priority badge when ratio is between 0.5 and 0.99', () => {
    render(<PriorityBadge ratio={0.75} label="Medium Priority" />);
    expect(screen.getByText('Medium Priority')).toBeInTheDocument();
  });

  it('renders Low Priority badge when ratio is below 0.5', () => {
    render(<PriorityBadge ratio={0.2} label="Low Priority" />);
    expect(screen.getByText('Low Priority')).toBeInTheDocument();
  });
});
