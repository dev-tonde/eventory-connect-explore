
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useUsernameValidation = (initialUsername: string = "") => {
  const { user } = useAuth();
  const [username, setUsername] = useState(initialUsername);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username === initialUsername) {
        setIsAvailable(null);
        setError(null);
        return;
      }

      if (username.length < 3) {
        setError("Username must be at least 3 characters long");
        setIsAvailable(false);
        return;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError("Username can only contain letters, numbers, and underscores");
        setIsAvailable(false);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", user?.id || "")
          .maybeSingle();

        if (error) throw error;

        setIsAvailable(!data);
      } catch (err) {
        console.error("Error checking username:", err);
        setError("Error checking username availability");
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username, initialUsername, user?.id]);

  return {
    username,
    setUsername,
    isChecking,
    isAvailable,
    error,
  };
};
