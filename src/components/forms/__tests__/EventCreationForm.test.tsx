import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EventCreationForm from '../EventCreationForm';

// Mock the auth context
const mockUser = { id: 'user-1', email: 'test@example.com' };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: true }),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock Supabase operations
const mockSupabaseInsert = vi.fn();
const mockSupabaseSelect = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockSupabaseInsert,
      select: mockSupabaseSelect,
    })),
  },
}));

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

describe('EventCreationForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseInsert.mockResolvedValue({ data: { id: 'new-event' }, error: null });
  });

  it('renders all required form fields', () => {
    render(
      <TestWrapper>
        <EventCreationForm />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/venue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EventCreationForm />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/venue is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EventCreationForm />
      </TestWrapper>
    );

    // Fill out the form
    await user.type(screen.getByLabelText(/event title/i), 'Test Event');
    await user.type(screen.getByLabelText(/description/i), 'A great test event');
    await user.type(screen.getByLabelText(/venue/i), 'Test Venue');
    await user.type(screen.getByLabelText(/price/i), '25.99');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Event',
          description: 'A great test event',
          venue: 'Test Venue',
          price: 25.99,
          organizer_id: 'user-1',
        })
      );
    });
  });

  it('sanitizes input to prevent XSS attacks', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EventCreationForm />
      </TestWrapper>
    );

    const maliciousTitle = '<script>alert("xss")</script>Safe Title';
    await user.type(screen.getByLabelText(/event title/i), maliciousTitle);
    
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Safe Title', // Script tags should be removed
        })
      );
    });
  });

  it('handles dynamic pricing toggle', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <EventCreationForm />
      </TestWrapper>
    );

    const dynamicPricingToggle = screen.getByLabelText(/enable dynamic pricing/i);
    await user.click(dynamicPricingToggle);

    expect(screen.getByLabelText(/minimum price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum price/i)).toBeInTheDocument();
  });

  it('shows error message on submission failure', async () => {
    const user = userEvent.setup();
    mockSupabaseInsert.mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' } 
    });
    
    render(
      <TestWrapper>
        <EventCreationForm />
      </TestWrapper>
    );

    // Fill out minimal required fields
    await user.type(screen.getByLabelText(/event title/i), 'Test Event');
    await user.type(screen.getByLabelText(/venue/i), 'Test Venue');
    
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });
  });
});