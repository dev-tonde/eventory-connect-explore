import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536';
  quality?: 'high' | 'medium' | 'low' | 'auto';
  style?: 'vivid' | 'natural';
  output_format?: 'png' | 'jpeg' | 'webp';
  event_id?: string;
  user_id?: string;
}

interface GeneratedImage {
  image_url: string;
  image_base64: string;
  prompt: string;
  size: string;
}

export function useImageGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async (options: ImageGenerationOptions): Promise<GeneratedImage> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('openai-image-generation', {
        body: options,
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate image';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEventPoster = async (
    eventTitle: string,
    eventDate: string,
    eventVenue: string,
    eventCategory: string,
    userId?: string,
    eventId?: string
  ) => {
    const prompt = `Create a modern, vibrant event poster for "${eventTitle}". 
      Event details: ${eventDate} at ${eventVenue}. 
      Category: ${eventCategory}. 
      Make it visually appealing with bold typography, 
      bright colors, and professional design. 
      Include space for event information. 
      High quality, poster design, marketing material.`;

    return generateImage({
      prompt,
      size: '1024x1536', // Portrait format good for posters
      quality: 'high',
      style: 'vivid',
      output_format: 'png',
      event_id: eventId,
      user_id: userId
    });
  };

  const generateSocialMediaImage = async (
    eventTitle: string,
    eventDate: string,
    platform: 'instagram' | 'facebook' | 'twitter' = 'instagram',
    userId?: string,
    eventId?: string
  ) => {
    const sizes = {
      instagram: '1024x1024' as const,
      facebook: '1536x1024' as const,
      twitter: '1536x1024' as const
    };

    const prompt = `Create a social media post image for "${eventTitle}" on ${eventDate}. 
      Make it eye-catching, modern, and optimized for ${platform}. 
      Bold text, vibrant colors, clean design. 
      Social media ready, engaging visual.`;

    return generateImage({
      prompt,
      size: sizes[platform],
      quality: 'high',
      style: 'vivid',
      output_format: 'png',
      event_id: eventId,
      user_id: userId
    });
  };

  const generateCustomImage = async (
    prompt: string,
    options: Partial<ImageGenerationOptions> = {}
  ) => {
    return generateImage({
      prompt,
      size: '1024x1024',
      quality: 'auto',
      style: 'vivid',
      output_format: 'png',
      ...options
    });
  };

  return {
    generateImage,
    generateEventPoster,
    generateSocialMediaImage,
    generateCustomImage,
    isLoading,
    error,
  };
}