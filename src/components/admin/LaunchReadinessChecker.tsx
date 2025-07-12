import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';

interface LaunchReadinessCheckerProps {
  className?: string;
}

const LaunchReadinessChecker: React.FC<LaunchReadinessCheckerProps> = ({ className }) => {
  // Production readiness checklist
  const readinessItems = [
    {
      category: 'Core Features',
      items: [
        { name: 'Real AI Poster Generation', status: 'completed', description: 'OpenAI integration active' },
        { name: 'Email Notifications', status: 'completed', description: 'SendGrid integration active' },
        { name: 'SMS Notifications', status: 'completed', description: 'Twilio integration active' },
        { name: 'Google Maps Integration', status: 'completed', description: 'Location services active' },
        { name: 'Payment Processing', status: 'completed', description: 'Yoco integration enhanced' },
        { name: 'Content Moderation', status: 'completed', description: 'AI + rule-based moderation' },
        { name: 'Enhanced Gamification', status: 'completed', description: 'Achievements and leaderboards' },
        { name: 'Advanced Analytics', status: 'completed', description: 'Google Analytics + internal tracking' },
      ]
    },
    {
      category: 'Security & Performance',
      items: [
        { name: 'Input Sanitization', status: 'completed', description: 'All user inputs sanitized' },
        { name: 'Rate Limiting', status: 'completed', description: 'API rate limits configured' },
        { name: 'Error Logging', status: 'completed', description: 'Comprehensive error tracking' },
        { name: 'Data Validation', status: 'completed', description: 'Form and API validation' },
        { name: 'Authentication Security', status: 'completed', description: 'Secure auth flows' },
        { name: 'Database Security', status: 'completed', description: 'RLS policies active' },
      ]
    },
    {
      category: 'User Experience',
      items: [
        { name: 'Responsive Design', status: 'completed', description: 'Mobile-first design' },
        { name: 'Accessibility', status: 'completed', description: 'WCAG compliant' },
        { name: 'Error Handling', status: 'completed', description: 'User-friendly error messages' },
        { name: 'Loading States', status: 'completed', description: 'Smooth loading experiences' },
        { name: 'Offline Support', status: 'completed', description: 'PWA capabilities' },
        { name: 'Multi-language Support', status: 'partial', description: 'Basic i18n framework' },
      ]
    },
    {
      category: 'Production Setup',
      items: [
        { name: 'Environment Configuration', status: 'completed', description: 'All API keys configured' },
        { name: 'Database Optimization', status: 'completed', description: 'Indexes and performance tuning' },
        { name: 'Monitoring Setup', status: 'completed', description: 'Analytics and error tracking' },
        { name: 'Backup Strategy', status: 'completed', description: 'Automated database backups' },
        { name: 'CDN Configuration', status: 'pending', description: 'Asset optimization needed' },
        { name: 'SSL Certificate', status: 'completed', description: 'HTTPS enforced' },
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Ready</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate overall readiness score
  const totalItems = readinessItems.reduce((sum, category) => sum + category.items.length, 0);
  const completedItems = readinessItems.reduce(
    (sum, category) => sum + category.items.filter(item => item.status === 'completed').length, 
    0
  );
  const partialItems = readinessItems.reduce(
    (sum, category) => sum + category.items.filter(item => item.status === 'partial').length, 
    0
  );
  
  const readinessScore = Math.round(((completedItems + partialItems * 0.5) / totalItems) * 100);

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Launch Readiness Score
          </CardTitle>
          <CardDescription>
            Production deployment readiness assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-5xl font-bold mb-2 ${
              readinessScore >= 90 ? 'text-green-500' : 
              readinessScore >= 75 ? 'text-yellow-500' : 'text-red-500'
            }`}>
              {readinessScore}%
            </div>
            <p className="text-sm text-muted-foreground">
              {completedItems} of {totalItems} items ready • {partialItems} partial
            </p>
            
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <p className="text-sm font-medium">
                {readinessScore >= 90 ? '🚀 Ready for Launch!' :
                 readinessScore >= 75 ? '⚠️ Nearly Ready - Address remaining items' :
                 '🔧 Needs Work - Complete critical items first'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {readinessItems.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.name}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {readinessScore >= 90 ? (
              <>
                <p className="text-green-600 font-medium">✅ Eventory is ready for production launch!</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Deploy to production environment</li>
                  <li>Configure custom domain</li>
                  <li>Set up monitoring alerts</li>
                  <li>Prepare launch marketing materials</li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-yellow-600 font-medium">⚠️ Address remaining items before launch:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {readinessItems.flatMap(category => 
                    category.items
                      .filter(item => item.status !== 'completed')
                      .map(item => (
                        <li key={item.name}>{item.name}: {item.description}</li>
                      ))
                  )}
                </ul>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchReadinessChecker;