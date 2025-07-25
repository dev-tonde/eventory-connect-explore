describe('E2E: Full RSVP Flow', () => {
  beforeEach(() => {
    // Reset database state
    cy.task('db:seed');
    // Mock authentication
    cy.login('test@example.com', 'testpassword');
  });

  it('completes end-to-end RSVP process', () => {
    // Start from homepage
    cy.visit('/');
    cy.contains('Find Events').should('be.visible');

    // Navigate to events page
    cy.get('[data-testid="browse-events-btn"]').click();
    cy.url().should('include', '/events');

    // Search for specific event
    cy.get('[data-testid="event-search"]').type('Test Concert');
    cy.get('[data-testid="search-submit"]').click();

    // Select first event from results
    cy.get('[data-testid="event-card"]').first().click();
    cy.url().should('include', '/events/');

    // Verify event details page
    cy.contains('Test Concert').should('be.visible');
    cy.contains('Purchase Tickets').should('be.visible');

    // Start ticket purchase
    cy.get('[data-testid="purchase-tickets-btn"]').click();

    // Fill out ticket purchase form
    cy.get('[data-testid="quantity-input"]').clear().type('2');
    cy.get('[data-testid="buyer-name"]').type('John Doe');
    cy.get('[data-testid="buyer-email"]').type('john@example.com');
    cy.get('[data-testid="buyer-phone"]').type('+1234567890');

    // Verify total calculation
    cy.get('[data-testid="total-price"]').should('contain', '$51.98');

    // Submit purchase
    cy.get('[data-testid="purchase-submit"]').click();

    // Handle payment flow (mocked)
    cy.intercept('POST', '**/process-yoco-payment', {
      statusCode: 200,
      body: { success: true, paymentId: 'pay_123' }
    }).as('payment');

    cy.wait('@payment');

    // Verify success message
    cy.contains('Tickets Purchased Successfully').should('be.visible');
    cy.contains('EVT-').should('be.visible'); // Ticket number

    // Verify ticket appears in profile
    cy.visit('/profile');
    cy.get('[data-testid="profile-tab-tickets"]').click();
    cy.contains('Test Concert').should('be.visible');
    cy.contains('2 tickets').should('be.visible');

    // Verify QR codes are generated
    cy.get('[data-testid="ticket-qr-code"]').should('be.visible');
  });

  it('handles sold out events', () => {
    cy.visit('/events/sold-out-event');
    
    cy.contains('Sold Out').should('be.visible');
    cy.get('[data-testid="purchase-tickets-btn"]').should('be.disabled');
    
    // Should show waitlist option
    cy.contains('Join Waitlist').should('be.visible');
    cy.get('[data-testid="waitlist-btn"]').click();
    
    cy.contains('Added to Waitlist').should('be.visible');
  });

  it('applies dynamic pricing correctly', () => {
    // Visit event with dynamic pricing enabled
    cy.visit('/events/dynamic-pricing-event');
    
    cy.contains('Dynamic Pricing Active').should('be.visible');
    
    // Mock high demand scenario
    cy.intercept('GET', '**/get-dynamic-price/*', {
      statusCode: 200,
      body: { price: 35.99, multiplier: 1.5, reason: 'High demand' }
    }).as('dynamicPrice');
    
    cy.wait('@dynamicPrice');
    cy.contains('$35.99').should('be.visible');
    cy.contains('High demand').should('be.visible');
  });
});

describe('E2E: Organizer Event Management', () => {
  beforeEach(() => {
    cy.task('db:seed');
    cy.login('organizer@example.com', 'testpassword');
  });

  it('creates, edits, and deletes an event', () => {
    // Navigate to organizer dashboard
    cy.visit('/dashboard');
    cy.contains('Create Event').should('be.visible');

    // Create new event
    cy.get('[data-testid="create-event-btn"]').click();
    cy.url().should('include', '/create-event');

    // Fill out event creation form
    cy.get('[data-testid="event-title"]').type('My New Event');
    cy.get('[data-testid="event-description"]').type('An amazing new event');
    cy.get('[data-testid="event-venue"]').type('Convention Center');
    cy.get('[data-testid="event-date"]').type('2024-12-31');
    cy.get('[data-testid="event-time"]').type('19:00');
    cy.get('[data-testid="event-price"]').type('29.99');
    cy.get('[data-testid="event-category"]').select('Music');

    // Enable dynamic pricing
    cy.get('[data-testid="dynamic-pricing-toggle"]').click();
    cy.get('[data-testid="min-price"]').type('19.99');
    cy.get('[data-testid="max-price"]').type('49.99');

    // Submit form
    cy.get('[data-testid="create-event-submit"]').click();

    // Verify success and redirect
    cy.contains('Event Created Successfully').should('be.visible');
    cy.url().should('include', '/events/');

    // Verify event appears in organizer dashboard
    cy.visit('/dashboard');
    cy.contains('My New Event').should('be.visible');

    // Edit the event
    cy.get('[data-testid="edit-event-btn"]').first().click();
    cy.get('[data-testid="event-title"]').clear().type('My Updated Event');
    cy.get('[data-testid="edit-event-submit"]').click();

    cy.contains('Event Updated Successfully').should('be.visible');
    cy.contains('My Updated Event').should('be.visible');

    // Delete the event
    cy.get('[data-testid="delete-event-btn"]').first().click();
    cy.get('[data-testid="confirm-delete"]').click();

    cy.contains('Event Deleted Successfully').should('be.visible');
    cy.contains('My Updated Event').should('not.exist');
  });

  it('generates AI poster for event', () => {
    cy.visit('/events/test-event');
    
    // Access poster studio
    cy.get('[data-testid="generate-poster-btn"]').click();
    cy.url().should('include', '/poster-studio');

    // Fill out AI prompt
    cy.get('[data-testid="ai-prompt"]').type('Create a vibrant music festival poster');
    cy.get('[data-testid="poster-style"]').select('Modern');
    cy.get('[data-testid="social-platform"]').select('Instagram');

    // Mock AI generation
    cy.intercept('POST', '**/generate-ai-poster', {
      statusCode: 200,
      body: { 
        success: true, 
        imageUrl: 'data:image/svg+xml;base64,PHN2Zz4=',
        id: 'poster-123'
      }
    }).as('generatePoster');

    cy.get('[data-testid="generate-poster-submit"]').click();
    cy.wait('@generatePoster');

    // Verify poster generation
    cy.contains('Poster Generated Successfully').should('be.visible');
    cy.get('[data-testid="generated-poster"]').should('be.visible');

    // Download poster
    cy.get('[data-testid="download-poster-btn"]').click();
    cy.readFile('cypress/downloads/poster-123.png').should('exist');
  });
});

describe('E2E: SnapLoop Photo Upload Flow', () => {
  it('guest uploads photo via QR code', () => {
    // Simulate scanning QR code (direct URL access)
    cy.visit('/snaploop/upload?eventId=test-event');

    // Verify guest upload page
    cy.contains('SnapLoop').should('be.visible');
    cy.contains('Share your event photos').should('be.visible');

    // Upload photo
    const fileName = 'test-photo.jpg';
    cy.fixture(fileName).then(fileContent => {
      cy.get('[data-testid="photo-upload"]').attachFile({
        fileContent: fileContent.toString(),
        fileName: fileName,
        mimeType: 'image/jpeg'
      });
    });

    // Fill out guest information
    cy.get('[data-testid="guest-name"]').type('Jane Smith');
    cy.get('[data-testid="photo-caption"]').type('Great event! #amazing');

    // Submit upload
    cy.get('[data-testid="upload-submit"]').click();

    // Verify success
    cy.contains('Photo uploaded successfully').should('be.visible');
    cy.contains('under review').should('be.visible');
  });

  it('displays approved photos in live gallery', () => {
    cy.visit('/events/test-event');
    
    // Access SnapLoop gallery
    cy.get('[data-testid="snaploop-gallery-tab"]').click();

    // Verify approved photos are displayed
    cy.get('[data-testid="photo-grid"]').should('be.visible');
    cy.get('[data-testid="photo-item"]').should('have.length.greaterThan', 0);

    // Test photo modal
    cy.get('[data-testid="photo-item"]').first().click();
    cy.get('[data-testid="photo-modal"]').should('be.visible');
    cy.contains('Close').click();
    cy.get('[data-testid="photo-modal"]').should('not.exist');
  });
});