declare global {
  interface Window {
    termly_embed?: any;
  }
}

export const initTermly = (embedId: string) => {
  // Only load if not already loaded and embedId is provided
  if (!embedId || document.querySelector('[data-website-uuid]')) {
    return;
  }

  // Load Termly script as the first script for proper blocking
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://app.termly.io/embed.min.js`;
  script.setAttribute('data-auto-block', 'on');
  script.setAttribute('data-website-uuid', embedId);
  script.async = true;
  
  // Insert as first script in head
  const firstScript = document.head.querySelector('script');
  if (firstScript) {
    document.head.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
};

export const showTermlyBanner = () => {
  if (window.termly_embed) {
    window.termly_embed.showBanner();
  }
};

export const hideTermlyBanner = () => {
  if (window.termly_embed) {
    window.termly_embed.hideBanner();
  }
};

export const openTermlyPreferences = () => {
  if (window.termly_embed) {
    window.termly_embed.openPreferences();
  }
};