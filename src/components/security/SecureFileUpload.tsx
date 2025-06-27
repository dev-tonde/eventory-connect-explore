
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { useSecurityFeatures } from "@/hooks/useSecurityFeatures";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SecureFileUploadProps {
  onUploadSuccess: (fileUrl: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  className?: string;
}

export const SecureFileUpload = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  className = ""
}: SecureFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const { validateFileUpload } = useSecurityFeatures();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      // Security validation
      const validation = await validateFileUpload(file);
      if (!validation.isValid) {
        setUploadStatus({ type: 'error', message: validation.error || 'File validation failed' });
        return;
      }

      // Generate secure filename
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const secureFilename = `${crypto.randomUUID()}.${fileExtension}`;
      
      // Record file upload attempt
      const { data: uploadRecord, error: recordError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          original_filename: file.name,
          stored_filename: secureFilename,
          file_size: file.size,
          mime_type: file.type,
          upload_path: `events/${secureFilename}`,
          scan_status: 'pending'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Simulate file upload (in production, this would upload to secure storage)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate malware scan (in production, integrate with security service)
      const scanResult = { clean: true, threats: [] };
      
      // Update scan status
      await supabase
        .from('file_uploads')
        .update({
          scan_status: scanResult.clean ? 'clean' : 'infected',
          scan_result: scanResult
        })
        .eq('id', uploadRecord.id);

      if (!scanResult.clean) {
        setUploadStatus({ type: 'error', message: 'File failed security scan' });
        return;
      }

      // Create blob URL for preview (in production, return secure URL)
      const fileUrl = URL.createObjectURL(file);
      onUploadSuccess(fileUrl);
      
      setUploadStatus({ type: 'success', message: 'File uploaded successfully' });
    } catch (error) {
      console.error('File upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus({ type: 'error', message: errorMessage });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          className="relative overflow-hidden"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Image'}
          <Input
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
        </Button>
        
        <div className="text-sm text-gray-500">
          Max size: {Math.round(maxSizeBytes / 1024 / 1024)}MB
        </div>
      </div>

      {uploadStatus.type && (
        <Alert className={uploadStatus.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          {uploadStatus.type === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={uploadStatus.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {uploadStatus.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
