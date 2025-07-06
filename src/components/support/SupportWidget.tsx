import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, HelpCircle, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerSupport } from '@/hooks/useCustomerSupport';

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openSupport } = useCustomerSupport();

  const handleIntercomSupport = () => {
    openSupport();
    setIsOpen(false);
  };

  const quickActions = [
    {
      icon: MessageCircle,
      label: 'Live Chat',
      description: 'Get instant help from our team',
      action: handleIntercomSupport,
    },
    {
      icon: Mail,
      label: 'Email Support',
      description: 'Send us a detailed message',
      action: () => window.location.href = 'mailto:support@eventory.co.za',
    },
    {
      icon: HelpCircle,
      label: 'Help Center',
      description: 'Browse our knowledge base',
      action: () => window.open('/help', '_blank'),
    },
  ];

  return (
    <>
      {/* Support Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200"
          aria-label="Open support menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Support Menu */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40">
          <Card className="w-80 shadow-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How can we help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={action.action}
                >
                  <action.icon className="h-5 w-5 mr-3 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.description}
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default SupportWidget;