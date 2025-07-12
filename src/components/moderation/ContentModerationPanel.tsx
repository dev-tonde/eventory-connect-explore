import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Clock, Flag } from 'lucide-react';
import { useContentModeration } from '@/hooks/useContentModeration';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContentModerationPanelProps {
  className?: string;
}

const ContentModerationPanel: React.FC<ContentModerationPanelProps> = ({ className }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { moderateContent, isChecking } = useContentModeration();
  
  const [testContent, setTestContent] = useState({
    title: '',
    description: '',
    type: 'event' as 'event' | 'message' | 'comment' | 'profile'
  });
  
  const [moderationResult, setModerationResult] = useState<any>(null);

  const handleTestModeration = async () => {
    if (!testContent.title && !testContent.description) {
      toast({
        title: "No Content",
        description: "Please enter some content to test moderation.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await moderateContent({
        title: testContent.title,
        description: testContent.description,
        type: testContent.type,
      }, true); // Use AI moderation

      setModerationResult(result);
      
      toast({
        title: "Moderation Complete",
        description: result.isApproved ? "Content approved ✅" : "Content flagged ⚠️",
        variant: result.isApproved ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Moderation test failed:', error);
    }
  };

  const getModerationStatusIcon = (isApproved: boolean) => {
    return isApproved ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-500" />
    );
  };

  const getModerationStatusColor = (isApproved: boolean) => {
    return isApproved ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Content Moderation
          </CardTitle>
          <CardDescription>
            Test and monitor automated content moderation system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Content Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <select
                id="content-type"
                value={testContent.type}
                onChange={(e) => setTestContent(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="event">Event</option>
                <option value="message">Message</option>
                <option value="comment">Comment</option>
                <option value="profile">Profile</option>
              </select>
            </div>

            <div>
              <Label htmlFor="test-title">Title</Label>
              <Input
                id="test-title"
                value={testContent.title}
                onChange={(e) => setTestContent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title..."
              />
            </div>

            <div>
              <Label htmlFor="test-description">Description/Content</Label>
              <Textarea
                id="test-description"
                value={testContent.description}
                onChange={(e) => setTestContent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter content description..."
                rows={4}
              />
            </div>

            <Button 
              onClick={handleTestModeration}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Checking Content...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Test Moderation
                </>
              )}
            </Button>
          </div>

          {/* Moderation Results */}
          {moderationResult && (
            <Card className={getModerationStatusColor(moderationResult.isApproved)}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getModerationStatusIcon(moderationResult.isApproved)}
                  Moderation Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={moderationResult.isApproved ? "secondary" : "destructive"}>
                    {moderationResult.isApproved ? "Approved" : "Rejected"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Confidence:</span>
                  <span className="text-sm">
                    {(moderationResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {moderationResult.flags.length > 0 && (
                  <div>
                    <span className="font-medium">Flags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {moderationResult.flags.map((flag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {moderationResult.reason && (
                  <div>
                    <span className="font-medium">Reason:</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {moderationResult.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Moderation Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Moderation Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Prohibited Content:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Spam, scams, or fraudulent content</li>
                  <li>Hate speech or discriminatory language</li>
                  <li>Violence or harassment</li>
                  <li>Illegal activities or substances</li>
                  <li>Adult or inappropriate content</li>
                  <li>Personal information (credit cards, SSNs)</li>
                </ul>
                
                <p className="pt-2"><strong>AI + Rule-based:</strong></p>
                <p>Content is checked using both local rules and OpenAI moderation for comprehensive filtering.</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentModerationPanel;