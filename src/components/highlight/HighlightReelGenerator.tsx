import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Video, 
  Download, 
  Share2, 
  Clock, 
  Image as ImageIcon, 
  Sparkles,
  Play,
  AlertCircle 
} from "lucide-react";
import { useHighlightReel } from "@/hooks/useHighlightReel";
import { format } from "date-fns";

interface HighlightReelGeneratorProps {
  eventId: string;
  organizerId: string;
  eventTitle: string;
}

export const HighlightReelGenerator: React.FC<HighlightReelGeneratorProps> = ({
  eventId,
  organizerId,
  eventTitle
}) => {
  const {
    isGenerating,
    reels,
    currentReel,
    generateHighlightReel,
    fetchHighlightReels,
    checkGenerationStatus,
    downloadHighlightReel,
    shareHighlightReel
  } = useHighlightReel();

  const [options, setOptions] = useState({
    duration: 60,
    photoCount: 20,
    style: 'slideshow'
  });

  useEffect(() => {
    fetchHighlightReels(eventId, organizerId);
  }, [eventId, organizerId]);

  // Poll for generation status updates
  useEffect(() => {
    if (currentReel && currentReel.status === 'generating') {
      const interval = setInterval(() => {
        checkGenerationStatus(currentReel.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentReel]);

  const handleGenerate = async () => {
    await generateHighlightReel(eventId, organizerId, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'generating': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Video className="h-4 w-4" />;
      case 'generating': return <Clock className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Highlight Reel Generator</h2>
        <p className="text-muted-foreground">
          Create a 60-second highlight reel from your event's top photos
        </p>
      </div>

      {/* Generation Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5" />
            <span>Create New Highlight Reel</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Duration (seconds)</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={options.duration}
                onChange={(e) => setOptions(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Number of Photos</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={options.photoCount}
                onChange={(e) => setOptions(prev => ({ ...prev, photoCount: parseInt(e.target.value) }))}
              >
                <option value={15}>15 photos</option>
                <option value={20}>20 photos</option>
                <option value={25}>25 photos</option>
                <option value={30}>30 photos</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Style</label>
              <select 
                className="w-full mt-1 p-2 border rounded-md"
                value={options.style}
                onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value }))}
              >
                <option value="slideshow">Slideshow</option>
                <option value="dynamic">Dynamic Transitions</option>
                <option value="cinematic">Cinematic</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating Highlight Reel...
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Generate Highlight Reel
              </>
            )}
          </Button>

          <Alert>
            <ImageIcon className="h-4 w-4" />
            <AlertDescription>
              The highlight reel will use the top {options.photoCount} most-liked photos from your event.
              Generation typically takes 2-5 minutes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Current Generation Status */}
      {currentReel && currentReel.status === 'generating' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 animate-spin" />
              <span>Generation in Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Creating your highlight reel...</span>
                <span>Processing</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
            <p className="text-sm text-muted-foreground">
              Using {currentReel.photo_count} photos • {currentReel.duration_seconds}s duration
            </p>
          </CardContent>
        </Card>
      )}

      {/* Existing Highlight Reels */}
      {reels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Highlight Reels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reels.map((reel) => (
              <div
                key={reel.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  {reel.thumbnail_url && (
                    <img
                      src={reel.thumbnail_url}
                      alt="Highlight reel thumbnail"
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(reel.status)}>
                        {getStatusIcon(reel.status)}
                        <span className="ml-1 capitalize">{reel.status}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {reel.duration_seconds}s • {reel.photo_count} photos
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created: {format(new Date(reel.created_at), 'MMM d, yyyy HH:mm')}
                    </p>
                    {reel.error_message && (
                      <p className="text-sm text-red-600">{reel.error_message}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {reel.status === 'completed' && reel.video_url && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(reel.video_url, '_blank')}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadHighlightReel(reel)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => shareHighlightReel(reel, 'general')}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </>
                  )}
                  
                  {reel.status === 'generating' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => checkGenerationStatus(reel.id)}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Check Status
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No reels yet */}
      {reels.length === 0 && !isGenerating && (
        <Card>
          <CardContent className="py-8 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No highlight reels generated yet. Create your first one to showcase your event's best moments!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
