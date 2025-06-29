
export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const updatePageMetadata = (metadata: PageMetadata) => {
  // Update document title
  document.title = metadata.title;

  // Update or create meta tags
  const metaTags = [
    { name: 'description', content: metadata.description },
    { name: 'keywords', content: metadata.keywords || '' },
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:image', content: metadata.image || '/placeholder.svg' },
    { property: 'og:url', content: metadata.url || window.location.href },
    { property: 'og:type', content: metadata.type || 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: metadata.title },
    { name: 'twitter:description', content: metadata.description },
    { name: 'twitter:image', content: metadata.image || '/placeholder.svg' },
  ];

  metaTags.forEach(({ name, property, content }) => {
    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      if (name) element.name = name;
      if (property) element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    
    element.content = content;
  });
};

export const generateEventMetadata = (event: any): PageMetadata => ({
  title: `${event.title} | Eventory`,
  description: event.description?.substring(0, 160) || `Join ${event.title} on ${event.date} at ${event.location}. ${event.price === 0 ? 'Free event' : `Starting from $${event.price}`}`,
  keywords: `event, ${event.category}, ${event.location}, ${event.tags?.join(', ') || ''}`,
  image: event.image,
  type: 'event'
});

export const defaultMetadata: PageMetadata = {
  title: 'Eventory - Discover Amazing Events',
  description: 'Connect with your community through AI-powered event discovery, dynamic pricing, and seamless social integration. Find and create amazing events.',
  keywords: 'events, community, AI, event discovery, dynamic pricing, social integration',
  type: 'website'
};
