import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  requiresTextConfirmation?: boolean;
  confirmationText?: string;
  variant?: "default" | "destructive";
}

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  requiresTextConfirmation = false,
  confirmationText = "DELETE",
  variant = "default",
}: ConfirmationDialogProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (requiresTextConfirmation && inputValue !== confirmationText) return;
    setIsLoading(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      // Optionally show a toast or error message here
      // console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
      setInputValue("");
    }
  };

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const canConfirm =
    !requiresTextConfirmation || inputValue === confirmationText;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertTriangle
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requiresTextConfirmation && (
          <div className="my-4">
            <p className="text-sm text-gray-600 mb-2">
              Type <strong>{confirmationText}</strong> to confirm:
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmationText}
              className="font-mono"
              autoFocus
              aria-label={`Type ${confirmationText} to confirm`}
              maxLength={confirmationText.length}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} type="button">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
            className={
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""
            }
            type="button"
            aria-label={confirmText}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
// This component provides a confirmation dialog with optional text input for additional confirmation.
// It can be used for destructive actions like deleting items or confirming critical operations.
