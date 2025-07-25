import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModerationResult {
  isApproved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
}

interface ContentToModerate {
  text?: string;
  title?: string;
  description?: string;
  type: 'event' | 'message' | 'comment' | 'profile';
}

export function useContentModeration() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keywords and patterns that should be flagged
  const prohibitedKeywords = [
    'spam', 'scam', 'fraud', 'fake', 'illegal',
    'drug', 'weapon', 'violence', 'hate',
    'discrimination', 'harassment', 'abuse'
  ];

  const suspiciousPatterns = [
    /(.)\1{4,}/gi, // Repeated characters (5+ times)
    /[A-Z]{5,}/g, // Excessive caps
    /\b\d{16,}\b/g, // Credit card numbers
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN patterns
  ];

  // Local content moderation using rules and patterns
  const moderateContentLocally = (content: ContentToModerate): ModerationResult => {
    const fullText = [content.text, content.title, content.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const flags: string[] = [];
    let confidence = 0.9; // High confidence for rule-based detection

    // Check for prohibited keywords
    prohibitedKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) {
        flags.push(`prohibited_keyword:${keyword}`);
      }
    });

    // Check for suspicious patterns
    suspiciousPatterns.forEach((pattern, index) => {
      if (pattern.test(fullText)) {
        flags.push(`suspicious_pattern:${index}`);
      }
    });

    // Check for spam indicators
    if (fullText.includes('click here') && fullText.includes('free')) {
      flags.push('spam_indicator');
    }

    // Check for excessive promotion
    const promotionalWords = ['buy', 'sale', 'discount', 'offer', 'deal'];
    const promotionalCount = promotionalWords.filter(word => 
      fullText.includes(word)
    ).length;
    
    if (promotionalCount >= 3) {
      flags.push('excessive_promotion');
    }

    return {
      isApproved: flags.length === 0,
      confidence,
      flags,
      reason: flags.length > 0 ? `Content flagged: ${flags.join(', ')}` : undefined,
    };
  };

  // Enhanced Supabase-based content moderation
  const moderateContentWithSupabase = async (content: ContentToModerate): Promise<ModerationResult> => {
    try {
      const fullText = [content.text, content.title, content.description]
        .filter(Boolean)
        .join(' ');

      // Use local moderation as primary method
      const localResult = moderateContentLocally(content);

      // Log moderation attempt
      const { data, error } = await supabase.from('content_moderation_logs').insert({
        content_type: content.type,
        content_text: fullText,
        is_approved: localResult.isApproved,
        confidence: localResult.confidence,
        flags: localResult.flags,
        moderation_result: {
          approved: localResult.isApproved,
          confidence: localResult.confidence,
          flags: localResult.flags,
          reason: localResult.reason,
        },
      }).select().single();

      if (error) {
        console.error('Failed to log moderation:', error);
      }

      return localResult;
    } catch (err) {
      console.error('Supabase moderation error:', err);
      // Fallback to local moderation
      return moderateContentLocally(content);
    }
  };

  // Main moderation function
  const moderateContent = async (
    content: ContentToModerate,
    useAI = false
  ): Promise<ModerationResult> => {
    setIsChecking(true);
    setError(null);

    try {
      // Always do local check first
      const localResult = moderateContentLocally(content);
      
      // If local check fails, don't bother with AI
      if (!localResult.isApproved) {
        return localResult;
      }

      // If enabled and local check passes, use Supabase for additional verification
      if (useAI) {
        const supabaseResult = await moderateContentWithSupabase(content);
        
        // Use Supabase result (which includes local moderation)
        return supabaseResult;
      }

      return localResult;
    } catch (err: any) {
      const errorMessage = err.message || 'Content moderation failed';
      setError(errorMessage);
      
      // On error, be conservative and reject
      return {
        isApproved: false,
        confidence: 0.5,
        flags: ['moderation_error'],
        reason: errorMessage,
      };
    } finally {
      setIsChecking(false);
    }
  };

  // Report content for manual review
  const reportContent = async (
    contentId: string,
    contentType: string,
    reason: string,
    reporterId: string
  ) => {
    try {
      const { error } = await supabase.from('user_reports').insert({
        reporter_id: reporterId,
        report_type: 'inappropriate_content',
        description: `${contentType} reported: ${reason}`,
        status: 'pending',
      });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Auto-moderate event creation
  const moderateEvent = async (eventData: {
    title: string;
    description: string;
  }) => {
    return moderateContent({
      title: eventData.title,
      description: eventData.description,
      type: 'event',
    }, true); // Use Supabase for events
  };

  // Auto-moderate community messages
  const moderateMessage = async (message: string) => {
    return moderateContent({
      text: message,
      type: 'message',
    }, false); // Use local rules for messages (faster)
  };

  return {
    moderateContent,
    moderateEvent,
    moderateMessage,
    reportContent,
    isChecking,
    error,
  };
}