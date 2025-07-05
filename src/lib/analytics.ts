declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface AnalyticsEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

class GoogleAnalytics {
  private isInitialized = false;
  private measurementId: string | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Get Google Analytics configuration
      const response = await fetch('/api/google-analytics-config');
      const { measurementId } = await response.json();
      
      if (!measurementId) {
        console.warn('Google Analytics measurement ID not configured');
        return;
      }

      this.measurementId = measurementId;

      // Load Google Analytics script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      // Initialize dataLayer and gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(...args: any[]) {
        window.dataLayer.push(args);
      };

      // Configure Google Analytics
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      this.isInitialized = true;
      console.log('Google Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  }

  // Track page views
  trackPageView(page_title?: string, page_location?: string) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('config', this.measurementId!, {
      page_title: page_title || document.title,
      page_location: page_location || window.location.href,
    });
  }

  // Track events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', event.action, {
      event_category: event.category || 'general',
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    });
  }

  // Track user engagement events
  trackUserEngagement(action: string, details?: Record<string, any>) {
    this.trackEvent({
      action,
      category: 'user_engagement',
      custom_parameters: details,
    });
  }

  // Track event-related actions
  trackEventAction(action: string, eventId?: string, details?: Record<string, any>) {
    this.trackEvent({
      action,
      category: 'events',
      label: eventId,
      custom_parameters: {
        event_id: eventId,
        ...details,
      },
    });
  }

  // Track e-commerce events
  trackPurchase(transactionId: string, value: number, items: any[]) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: 'ZAR',
      items: items,
    });
  }

  // Track search events
  trackSearch(searchTerm: string, category?: string) {
    this.trackEvent({
      action: 'search',
      category: 'site_search',
      label: searchTerm,
      custom_parameters: {
        search_term: searchTerm,
        search_category: category,
      },
    });
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean = true) {
    this.trackEvent({
      action: success ? 'form_submit_success' : 'form_submit_error',
      category: 'forms',
      label: formName,
      custom_parameters: {
        form_name: formName,
      },
    });
  }

  // Track social sharing
  trackSocialShare(platform: string, contentType: string, contentId?: string) {
    this.trackEvent({
      action: 'share',
      category: 'social',
      label: platform,
      custom_parameters: {
        content_type: contentType,
        content_id: contentId,
        platform: platform,
      },
    });
  }
}

// Create singleton instance
export const analytics = new GoogleAnalytics();

// Initialize on module load
if (typeof window !== 'undefined') {
  analytics.initialize();
}

// Convenience functions for common tracking scenarios
export const trackPageView = (title?: string, location?: string) => 
  analytics.trackPageView(title, location);

export const trackEvent = (event: AnalyticsEvent) => 
  analytics.trackEvent(event);

export const trackEventView = (eventId: string, eventTitle?: string) =>
  analytics.trackEventAction('view_event', eventId, { event_title: eventTitle });

export const trackEventCreate = (eventId: string) =>
  analytics.trackEventAction('create_event', eventId);

export const trackTicketPurchase = (eventId: string, ticketPrice: number, quantity: number) =>
  analytics.trackEventAction('purchase_ticket', eventId, { 
    ticket_price: ticketPrice, 
    quantity: quantity,
    total_value: ticketPrice * quantity 
  });

export const trackNewsletterSignup = (genre: string) =>
  analytics.trackUserEngagement('newsletter_signup', { genre });

export const trackSearch = (searchTerm: string, category?: string) =>
  analytics.trackSearch(searchTerm, category);

export const trackFormSubmission = (formName: string, success: boolean = true) =>
  analytics.trackFormSubmission(formName, success);

export const trackSocialShare = (platform: string, contentType: string, contentId?: string) =>
  analytics.trackSocialShare(platform, contentType, contentId);