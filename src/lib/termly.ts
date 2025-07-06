declare global {
  interface Window {
    termly_embed?: any;
  }
}

export const initTermly = (embedId: string) => {
  // Load Termly script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://app.termly.io/embed.min.js`;
  script.setAttribute('data-auto-block', 'on');
  script.setAttribute('data-website-uuid', embedId);
  
  document.head.appendChild(script);
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