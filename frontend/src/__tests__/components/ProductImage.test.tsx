import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { ProductImage } from '../../components/ProductImage';

describe('ProductImage Component Tests', () => {
  it('renders image with given source URL and alt text', () => {
    render(
      <ProductImage
        src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80"
        alt="USB-C Cable"
        category="Electronics"
      />
    );

    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'USB-C Cable');
  });

  it('renders fallback icon and category name when source is missing', () => {
    render(<ProductImage alt="Missing Item" category="Electronics" />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('handles image load error and renders fallback', () => {
    render(
      <ProductImage
        src="https://invalid-broken-image-domain.xyz/broken.jpg"
        alt="Broken Image"
        category="Furniture"
      />
    );

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByText('Furniture')).toBeInTheDocument();
  });
});

