export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * Updates the document's metadata tags for SEO and social sharing.
 * Adds or updates title, description, Open Graph, and Twitter Card tags.
 */
export const updatePageMetadata = (metadata: PageMetadata) => {
  // Update document title
  document.title = metadata.title;

  // Define meta tags to update or create
  const metaTags = [
    { name: "description", content: metadata.description },
    { name: "keywords", content: metadata.keywords || "" },
    { property: "og:title", content: metadata.title },
    { property: "og:description", content: metadata.description },
    { property: "og:image", content: metadata.image || "/placeholder.svg" },
    { property: "og:url", content: metadata.url || window.location.href },
    { property: "og:type", content: metadata.type || "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: metadata.title },
    { name: "twitter:description", content: metadata.description },
    { name: "twitter:image", content: metadata.image || "/placeholder.svg" },
  ];

  metaTags.forEach(({ name, property, content }) => {
    const selector = name
      ? `meta[name="${name}"]`
      : `meta[property="${property}"]`;
    let element = document.querySelector(selector) as HTMLMetaElement | null;

    if (!element) {
      element = document.createElement("meta");
      if (name) element.name = name;
      if (property) element.setAttribute("property", property);
      document.head.appendChild(element);
    }

    element.content = content;
  });
};

/**
 * Generates SEO/social metadata for an event.
 */
export const generateEventMetadata = (event: {
  title: string;
  description?: string;
  date?: string;
  location?: string;
  price?: number;
  category?: string;
  tags?: string[];
  image?: string;
}): PageMetadata => ({
  title: `${event.title} | Eventory`,
  description:
    event.description?.substring(0, 160) ||
    `Join ${event.title}${event.date ? ` on ${event.date}` : ""}${
      event.location ? ` at ${event.location}` : ""
    }.${
      event.price === 0
        ? " Free event"
        : event.price
        ? ` Starting from R${event.price}`
        : ""
    }`,
  keywords: ["event", event.category, event.location, ...(event.tags || [])]
    .filter(Boolean)
    .join(", "),
  image: event.image,
  type: "event",
});

/**
 * Default metadata for the Eventory site.
 */
export const defaultMetadata: PageMetadata = {
  title: "Eventory - Discover Amazing Events",
  description:
    "Connect with your community through AI-powered event discovery, dynamic pricing, and seamless social integration. Find and create amazing events.",
  keywords:
    "events, community, AI, event discovery, dynamic pricing, social integration",
  type: "website",
};
