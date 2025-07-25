import { vi } from 'vitest';

// Mock Supabase client for testing
export const createMockSupabase = () => {
  const mockData = {
    events: [
      {
        id: 'event-1',
        title: 'Test Event',
        description: 'A test event',
        date: '2024-12-25',
        time: '18:00',
        venue: 'Test Venue',
        price: 25.99,
        organizer_id: 'org-1',
        is_active: true,
      }
    ],
    tickets: [
      {
        id: 'ticket-1',
        event_id: 'event-1',
        user_id: 'user-1',
        quantity: 1,
        total_price: 25.99,
        ticket_number: 'EVT-001',
        status: 'active',
      }
    ],
    profiles: [
      {
        id: 'user-1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'attendee',
      }
    ],
  };

  const mockSupabase = {
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      gt: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockData[table]?.[0], error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: mockData[table]?.[0] || null, error: null }),
      then: vi.fn().mockResolvedValue({ data: mockData[table] || [], error: null }),
    })),
    
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: mockData.profiles[0] }, 
        error: null 
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ 
        data: { user: mockData.profiles[0] }, 
        error: null 
      }),
      signUp: vi.fn().mockResolvedValue({ 
        data: { user: mockData.profiles[0] }, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
    },
    
    functions: {
      invoke: vi.fn().mockResolvedValue({ 
        data: { success: true }, 
        error: null 
      }),
    },
    
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ 
          data: { path: 'test-path' }, 
          error: null 
        }),
        getPublicUrl: vi.fn().mockReturnValue({ 
          data: { publicUrl: 'https://example.com/image.jpg' } 
        }),
      })),
    },
  };

  return mockSupabase;
};

// Mock data factories for consistent test data
export const createMockEvent = (overrides = {}) => ({
  id: 'test-event-1',
  title: 'Test Event',
  description: 'A test event description',
  date: '2024-12-25',
  time: '18:00',
  venue: 'Test Venue',
  address: '123 Test St',
  price: 25.99,
  max_attendees: 100,
  current_attendees: 50,
  category: 'Music',
  image_url: 'https://example.com/image.jpg',
  organizer_id: 'org-1',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  ...overrides,
});

export const createMockProfile = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  username: 'johndoe',
  role: 'attendee',
  bio: 'Test bio',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTicket = (overrides = {}) => ({
  id: 'ticket-1',
  event_id: 'event-1',
  user_id: 'user-1',
  quantity: 1,
  total_price: 25.99,
  ticket_number: 'EVT-001',
  status: 'active',
  purchase_date: '2024-01-01T00:00:00Z',
  qr_code: 'test-qr-code',
  qr_scanned_at: null,
  events: createMockEvent(),
  ...overrides,
});