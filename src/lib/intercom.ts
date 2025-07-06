declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
  }
}

export const initIntercom = (appId: string) => {
  // Load Intercom script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `https://widget.intercom.io/widget/${appId}`;
  
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  // Initialize Intercom settings
  window.intercomSettings = {
    app_id: appId,
    alignment: 'right',
    horizontal_padding: 20,
    vertical_padding: 20,
  };

  // Boot Intercom
  script.onload = () => {
    if (window.Intercom) {
      window.Intercom('boot', window.intercomSettings);
    }
  };
};

export const updateIntercomUser = (user: {
  user_id?: string;
  email?: string;
  name?: string;
  created_at?: number;
  custom_attributes?: Record<string, any>;
}) => {
  if (window.Intercom) {
    window.Intercom('update', user);
  }
};

export const showIntercom = () => {
  if (window.Intercom) {
    window.Intercom('show');
  }
};

export const hideIntercom = () => {
  if (window.Intercom) {
    window.Intercom('hide');
  }
};

export const shutdownIntercom = () => {
  if (window.Intercom) {
    window.Intercom('shutdown');
  }
};