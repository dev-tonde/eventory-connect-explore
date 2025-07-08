import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Settings, X } from 'lucide-react';
import { openTermlyPreferences } from '@/lib/termly';

const PrivacyBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a privacy choice (using sessionStorage)
    const hasConsented = sessionStorage.getItem('privacy-consent');
    if (!hasConsented) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    sessionStorage.setItem('privacy-consent', 'accepted');
    setIsVisible(false);
    // Enable all tracking
    window.gtag?.('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
    });
  };

  const handleRejectAll = () => {
    sessionStorage.setItem('privacy-consent', 'rejected');
    setIsVisible(false);
    // Disable all non-essential tracking
    window.gtag?.('consent', 'update', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      functionality_storage: 'granted', // Keep essential functionality
      personalization_storage: 'denied',
    });
  };

  const handleCustomize = () => {
    openTermlyPreferences();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Set a temporary dismissal (will show again on next visit)
    sessionStorage.setItem('privacy-banner-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="mx-auto max-w-4xl shadow-2xl border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Your Privacy Matters
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience, 
                analyze site usage, and assist with marketing. By continuing to use 
                Eventory, you consent to our use of cookies as described in our{' '}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </a>.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleAcceptAll}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Accept All
                </Button>
                
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  size="sm"
                >
                  Reject All
                </Button>
                
                <Button 
                  onClick={handleCustomize}
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Customize
                </Button>
              </div>
            </div>
            
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyBanner;