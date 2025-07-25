// Cypress commands for testing
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('not.include', '/auth');
  });
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.get('[data-testid="logout-btn"]').click();
  cy.url().should('include', '/');
});

Cypress.Commands.add('createTestEvent', (eventData: Partial<Event>) => {
  const defaultEvent = {
    title: 'Test Event',
    description: 'A test event',
    venue: 'Test Venue',
    date: '2024-12-31',
    time: '19:00',
    price: 29.99,
    category: 'Music',
    ...eventData,
  };

  cy.visit('/create-event');
  
  Object.entries(defaultEvent).forEach(([key, value]) => {
    if (key === 'category') {
      cy.get(`[data-testid="event-${key}"]`).select(value as string);
    } else {
      cy.get(`[data-testid="event-${key}"]`).type(value.toString());
    }
  });
  
  cy.get('[data-testid="create-event-submit"]').click();
  cy.contains('Event Created Successfully').should('be.visible');
});

// Custom commands for file upload
Cypress.Commands.add('attachFile', { prevSubject: 'element' }, (subject, file) => {
  return cy.wrap(subject).selectFile(file, { force: true });
});

// Database seeding for consistent test state
Cypress.Commands.add('dbSeed', () => {
  cy.task('db:seed');
});

// Performance testing helpers
Cypress.Commands.add('measurePageLoad', (url: string) => {
  cy.visit(url);
  cy.window().then((win) => {
    return new Promise((resolve) => {
      win.addEventListener('load', () => {
        const perfData = win.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        resolve(pageLoadTime);
      });
    });
  });
});

// Accessibility testing
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y(null, null, (violations) => {
    violations.forEach((violation) => {
      cy.log(`A11y violation: ${violation.id}`);
      cy.log(violation.description);
    });
  });
});

// Visual regression testing setup
Cypress.Commands.add('compareSnapshot', (name: string) => {
  cy.percySnapshot(name);
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createTestEvent(eventData: Partial<Event>): Chainable<void>;
      attachFile(file: any): Chainable<Element>;
      dbSeed(): Chainable<void>;
      measurePageLoad(url: string): Chainable<number>;
      checkA11y(): Chainable<void>;
      compareSnapshot(name: string): Chainable<void>;
    }
  }
}