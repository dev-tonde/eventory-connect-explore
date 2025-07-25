import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventCard from '../EventCard';

const mockEvent = {
  id: 'test-event-1',
  title: 'Test Event',
  description: 'A test event description',
  date: '2024-12-25',
  time: '18:00',
  venue: 'Test Venue',
  category: 'Music',
  image_url: 'https://example.com/image.jpg',
  price: 25.99,
  max_attendees: 100,
  current_attendees: 50
};

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('EventCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('$25.99')).toBeInTheDocument();
  });

  it('displays event date and time correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText(/12\/25\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/6:00 PM/)).toBeInTheDocument();
  });

  it('handles missing image gracefully', () => {
    const eventWithoutImage = { ...mockEvent, image_url: null };
    render(<EventCard event={eventWithoutImage} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder.svg');
  });

  it('navigates to event detail when clicked', async () => {
    const user = userEvent.setup();
    render(<EventCard event={mockEvent} />);
    
    const eventLink = screen.getByRole('link');
    await user.click(eventLink);
    
    expect(eventLink).toHaveAttribute('href', '/events/test-event-1');
  });

  it('sanitizes event title to prevent XSS', () => {
    const maliciousEvent = {
      ...mockEvent,
      title: '<script>alert("xss")</script>Test Event'
    };
    
    render(<EventCard event={maliciousEvent} />);
    
    // Should display sanitized title without script tags
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.queryByText('<script>')).not.toBeInTheDocument();
  });

  it('handles long descriptions with truncation', () => {
    const longDescription = 'A'.repeat(200);
    const eventWithLongDesc = {
      ...mockEvent,
      description: longDescription
    };
    
    render(<EventCard event={eventWithLongDesc} />);
    
    const description = screen.getByText(/A+/);
    expect(description.textContent?.length).toBeLessThan(200);
  });
});