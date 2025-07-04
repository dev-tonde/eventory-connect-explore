/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SecurityFeatures {
  checkFormRateLimit: (
    formType: string,
    maxSubmissions?: number
  ) => Promise<boolean>;
  logAdminAction: (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ) => Promise<void>;
  trackSession: () => Promise<void>;
  validateFileUpload: (
    file: File
  ) => Promise<{ isValid: boolean; error?: string }>;
  sanitizeInput: (input: string) => string;
}

/**
 * Custom hook providing security-related utilities: rate limiting, admin logging, session tracking, file validation, and input sanitization.
 */
export const useSecurityFeatures = (): SecurityFeatures => {
  const { user } = useAuth();

  /**
   * Checks if the user has exceeded the allowed number of form submissions.
   */
  const checkFormRateLimit = async (
    formType: string,
    maxSubmissions = 5
  ): Promise<boolean> => {
    try {
      const identifier = user?.id || "anonymous";
      const { data, error } = await supabase.rpc("check_form_rate_limit", {
        identifier_val: identifier,
        form_type_val: formType,
        max_submissions: maxSubmissions,
      });

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return false;
    }
  };

  /**
   * Logs an admin action for auditing.
   */
  const logAdminAction = async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: any
  ): Promise<void> => {
    try {
      await supabase.rpc("log_admin_action", {
        action_val: action,
        resource_type_val: resourceType,
        resource_id_val: resourceId,
        details_val: details || {},
      });
    } catch (error) {
      console.error("Admin action logging failed:", error);
    }
  };

  /**
   * Tracks a user session for security and analytics.
   */
  const trackSession = async (): Promise<void> => {
    if (!user) return;

    try {
      const sessionId = crypto.randomUUID();
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
      };

      await supabase.from("user_sessions").insert({
        user_id: user.id,
        session_id: sessionId,
        device_info: deviceInfo,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error("Session tracking failed:", error);
    }
  };

  /**
   * Validates a file upload for size, type, and extension.
   */
  const validateFileUpload = async (
    file: File
  ): Promise<{ isValid: boolean; error?: string }> => {
    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return { isValid: false, error: "File size must be less than 10MB" };
    }

    // File type validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Only JPEG, PNG, GIF, and WebP images are allowed",
      };
    }

    // File name validation
    const allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (!allowedExtensions.test(file.name)) {
      return { isValid: false, error: "Invalid file extension" };
    }

    return { isValid: true };
  };

  /**
   * Sanitizes input to prevent XSS and injection attacks.
   */
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .replace(/on\w+=/gi, "") // Remove event handlers
      .trim();
  };

  // Track session on mount or user change
  useEffect(() => {
    if (user) {
      trackSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    checkFormRateLimit,
    logAdminAction,
    trackSession,
    validateFileUpload,
    sanitizeInput,
  };
};
