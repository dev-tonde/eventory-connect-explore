import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TicketPurchase from '../TicketPurchase';

// Mock dependencies
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'event-1' }),
}));

const mockUser = { id: 'user-1', email: 'test@example.com' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock Supabase operations
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockSupabaseInsert,
      select: mockSupabaseSelect.mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    functions: {
      invoke: mockSupabaseInvoke,
    },
  },
}));

const mockEvent = {
  id: 'event-1',
  title: 'Test Event',
  price: 25.99,
  max_attendees: 100,
  current_attendees: 50,
  date: '2024-12-25',
  time: '18:00',
  venue: 'Test Venue',
  organizer_id: 'org-1',
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('TicketPurchase Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseSelect.mockResolvedValue({ data: mockEvent, error: null });
    mockSupabaseInsert.mockResolvedValue({ 
      data: { id: 'ticket-1', ticket_number: 'EVT-001' }, 
      error: null 
    });
    mockSupabaseInvoke.mockResolvedValue({ 
      data: { paymentUrl: 'https://payment.test' }, 
      error: null 
    });
  });

  it('renders ticket purchase form with event details', async () => {
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('$25.99')).toBeInTheDocument();
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
    });
  });

  it('allows quantity selection within available limit', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');

    expect(quantityInput).toHaveValue(3);
  });

  it('calculates total price correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');

    await waitFor(() => {
      expect(screen.getByText('$51.98')).toBeInTheDocument(); // 2 * $25.99
    });
  });

  it('validates required buyer information', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /purchase tickets/i })).toBeInTheDocument();
    });

    const purchaseButton = screen.getByRole('button', { name: /purchase tickets/i });
    await user.click(purchaseButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('processes successful ticket purchase', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Fill out buyer information
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '+1234567890');

    const purchaseButton = screen.getByRole('button', { name: /purchase tickets/i });
    await user.click(purchaseButton);

    await waitFor(() => {
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_id: 'event-1',
          user_id: 'user-1',
          quantity: 1,
          total_price: 25.99,
        })
      );
    });
  });

  it('handles payment processing errors', async () => {
    const user = userEvent.setup();
    mockSupabaseInvoke.mockResolvedValue({ 
      data: null, 
      error: { message: 'Payment failed' } 
    });
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Fill out buyer information
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    const purchaseButton = screen.getByRole('button', { name: /purchase tickets/i });
    await user.click(purchaseButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Payment Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('shows sold out state when at capacity', async () => {
    const soldOutEvent = { ...mockEvent, current_attendees: 100, max_attendees: 100 };
    mockSupabaseSelect.mockResolvedValue({ data: soldOutEvent, error: null });
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/sold out/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /purchase tickets/i })).toBeDisabled();
    });
  });

  it('applies dynamic pricing when enabled', async () => {
    const dynamicEvent = { ...mockEvent, dynamic_pricing_enabled: true };
    mockSupabaseSelect.mockResolvedValue({ data: dynamicEvent, error: null });
    
    render(
      <TestWrapper>
        <TicketPurchase />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/dynamic pricing/i)).toBeInTheDocument();
    });
  });
});