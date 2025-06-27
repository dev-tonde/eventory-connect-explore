
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";

interface UsernameInputProps {
  initialUsername: string;
  onUsernameChange: (username: string) => void;
}

const UsernameInput = ({ initialUsername, onUsernameChange }: UsernameInputProps) => {
  const { username, setUsername, isChecking, isAvailable, error } = useUsernameValidation(initialUsername);

  const handleChange = (value: string) => {
    setUsername(value);
    onUsernameChange(value);
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }
    
    if (error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (isAvailable === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (isAvailable === false && username !== initialUsername) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (isAvailable === true) return "Username is available";
    if (isAvailable === false && username !== initialUsername) return "Username is already taken";
    return "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Username
      </label>
      <div className="relative">
        <Input
          value={username}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your username"
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getStatusIcon()}
        </div>
      </div>
      {getStatusMessage() && (
        <p className={`text-xs mt-1 ${
          error || (isAvailable === false && username !== initialUsername) 
            ? "text-red-600" 
            : "text-green-600"
        }`}>
          {getStatusMessage()}
        </p>
      )}
    </div>
  );
};

export default UsernameInput;
