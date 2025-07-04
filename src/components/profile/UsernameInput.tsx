import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";

// Sanitize text to prevent XSS (defensive, though not used for user input here)
const sanitizeText = (text: string) =>
  typeof text === "string" ? text.replace(/[<>]/g, "").trim() : "";

interface UsernameInputProps {
  initialUsername: string;
  onUsernameChange: (username: string) => void;
}

const UsernameInput = ({
  initialUsername,
  onUsernameChange,
}: UsernameInputProps) => {
  const { username, setUsername, isChecking, isAvailable, error } =
    useUsernameValidation(initialUsername);

  const handleChange = (value: string) => {
    // Only allow alphanumeric, underscores, and dots, 3-20 chars
    const sanitized = sanitizeText(value)
      .replace(/[^a-zA-Z0-9_.]/g, "")
      .slice(0, 20);
    setUsername(sanitized);
    onUsernameChange(sanitized);
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <Loader2
          className="h-4 w-4 text-gray-400 animate-spin"
          aria-hidden="true"
        />
      );
    }
    if (error) {
      return <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />;
    }
    if (isAvailable === true) {
      return (
        <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
      );
    }
    if (isAvailable === false && username !== initialUsername) {
      return <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />;
    }
    return null;
  };

  const getStatusMessage = () => {
    if (error) return sanitizeText(error);
    if (isAvailable === true) return "Username is available";
    if (isAvailable === false && username !== initialUsername)
      return "Username is already taken";
    return "";
  };

  return (
    <div>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor="username-input"
      >
        Username
      </label>
      <div className="relative">
        <Input
          id="username-input"
          value={username}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your username"
          className="pr-10"
          autoComplete="username"
          maxLength={20}
          aria-label="Username"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getStatusIcon()}
        </div>
      </div>
      {getStatusMessage() && (
        <p
          className={`text-xs mt-1 ${
            error || (isAvailable === false && username !== initialUsername)
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {getStatusMessage()}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1">
        3-20 characters. Letters, numbers, underscores, and dots only.
      </p>
    </div>
  );
};

export default UsernameInput;
// This component allows users to input and validate their username.
// It checks availability against a backend service and provides real-time feedback on the username status.
// The username must be 3-20 characters long and can only contain letters, numbers, underscores, and dots.
// It includes a loading state while checking availability and displays appropriate icons and messages based on the validation result.
// The component uses a custom hook `useUsernameValidation` to handle the validation logic, which includes debouncing the input to avoid excessive API calls.
// The `sanitizeText` function is used to prevent XSS attacks by removing any potentially harmful characters from the input.
