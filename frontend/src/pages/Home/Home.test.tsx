import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from './Home';

// Mock react-router-dom's useNavigate
vi.mock('react-router', () => ({
  useNavigate: vi.fn()
}));

describe('Home Component', () => {
  const mockSocket = {
    emit: vi.fn()
  };

  it('renders the welcome title', () => {
    render(<Home socket={mockSocket as any} />);
    expect(screen.getByText('Welcome to Wave Chat')).toBeTruthy();
  });

  it('updates username on input change', () => {
    render(<Home socket={mockSocket as any} />);
    const input = screen.getByPlaceholderText('Enter your username');
    fireEvent.change(input, { target: { value: 'testuser' } });
    expect((input as HTMLInputElement).value).toBe('testuser');
  });
});
