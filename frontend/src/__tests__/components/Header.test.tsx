import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../../components/Header';

describe('Header Component Tests', () => {
  it('renders title and subtitle correctly', () => {
    render(
      <Header
        title="Central Inventory Module"
        subtitle="Currently available items in stock"
      />
    );

    expect(screen.getByText('Central Inventory Module')).toBeInTheDocument();
    expect(screen.getByText('Currently available items in stock')).toBeInTheDocument();
  });

  it('renders search bar and responds to input changes when onSearchChange is provided', () => {
    const handleSearch = vi.fn();

    render(
      <Header
        title="Warehouse Module"
        subtitle="Manage warehouse"
        onSearchChange={handleSearch}
        searchValue="Initial Search"
        searchPlaceholder="Type to search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Type to search...');
    expect(searchInput).toBeInTheDocument();
    expect((searchInput as HTMLInputElement).value).toBe('Initial Search');

    fireEvent.change(searchInput, { target: { value: 'New Search Term' } });
    expect(handleSearch).toHaveBeenCalledWith('New Search Term');
  });

  it('renders custom actions inside Header when provided', () => {
    render(
      <Header
        title="Custom Actions Header"
        actions={<button data-testid="custom-action-btn">Click Me</button>}
      />
    );

    expect(screen.getByTestId('custom-action-btn')).toBeInTheDocument();
  });
});
