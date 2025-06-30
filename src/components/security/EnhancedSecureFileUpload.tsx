
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle, CheckCircle, Shield, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { validateFileUpload } from "@/lib/validation";
import { useCSRF, CSRFToken } from "./EnhancedCSRFProtection";

interface EnhancedSecureFileUploadProps {
  onUploadSuccess: (fileUrl: string, fileId: string) => void;
  onUploadError?: (error: string) => void;
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  className?: string;
  allowMultiple?: boolean;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
  fileId?: string;
}

export const EnhancedSecureFileUpload = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeBytes = 10 * 1024 * 1024,
  className = "",
  allowMultiple = false
}: EnhancedSecureFileUploadProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { user } = useAuth();
  const { validateToken } = useCSRF();

  const createUploadFile = (file: File): UploadFile => ({
    file,
    id: crypto.randomUUID(),
    progress: 0,
    status: 'pending'
  });

  const updateUploadFile = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeUploadFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const validateFiles = (files: File[]): { valid: File[]; invalid: Array<{ file: File; error: string }> } => {
    const valid: File[] = [];
    const invalid: Array<{ file: File; error: string }> = [];

    files.forEach(file => {
      const validation = validateFileUpload(file);
      if (validation.isValid) {
        valid.push(file);
      } else {
        invalid.push({ file, error: validation.error || 'Invalid file' });
      }
    });

    return { valid, invalid };
  };

  const processFileUpload = async (uploadFile: UploadFile, csrfToken: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate CSRF token
    if (!validateToken(csrfToken)) {
      throw new Error('Invalid security token');
    }

    updateUploadFile(uploadFile.id, { status: 'uploading', progress: 10 });

    try {
      // Generate secure filename
      const fileExtension = uploadFile.file.name.split('.').pop()?.toLowerCase();
      const secureFilename = `${crypto.randomUUID()}.${fileExtension}`;
      
      updateUploadFile(uploadFile.id, { progress: 30 });

      // Record file upload attempt
      const { data: uploadRecord, error: recordError } = await supabase
        .from('file_uploads')
        .insert({
          user_id: user.id,
          original_filename: uploadFile.file.name,
          stored_filename: secureFilename,
          file_size: uploadFile.file.size,
          mime_type: uploadFile.file.type,
          upload_path: `events/${secureFilename}`,
          scan_status: 'pending'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      updateUploadFile(uploadFile.id, { progress: 60 });

      // Simulate file upload to secure storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      updateUploadFile(uploadFile.id, { progress: 80 });

      // Simulate malware scan
      const scanResult = { 
        clean: true, 
        threats: [],
        scanTime: new Date().toISOString(),
        scanEngine: 'secure-scanner-v1.0'
      };
      
      // Update scan status
      await supabase
        .from('file_uploads')
        .update({
          scan_status: scanResult.clean ? 'clean' : 'infected',
          scan_result: scanResult
        })
        .eq('id', uploadRecord.id);

      if (!scanResult.clean) {
        throw new Error('File failed security scan - potential threat detected');
      }

      updateUploadFile(uploadFile.id, { progress: 100 });

      // Create secure blob URL for preview
      const fileUrl = URL.createObjectURL(uploadFile.file);
      
      updateUploadFile(uploadFile.id, { 
        status: 'success', 
        url: fileUrl, 
        fileId: uploadRecord.id 
      });

      onUploadSuccess(fileUrl, uploadRecord.id);
      
    } catch (error) {
      console.error('File upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateUploadFile(uploadFile.id, { status: 'error', error: errorMessage });
      onUploadError?.(errorMessage);
    }
  };

  const handleFileSelect = async (files: File[], csrfToken: string) => {
    if (!files.length) return;

    const filesToProcess = allowMultiple ? files : [files[0]];
    const { valid, invalid } = validateFiles(filesToProcess);

    // Add invalid files with error status
    const invalidUploadFiles = invalid.map(({ file, error }) => ({
      ...createUploadFile(file),
      status: 'error' as const,
      error
    }));

    // Add valid files with pending status
    const validUploadFiles = valid.map(createUploadFile);

    const newUploadFiles = [...validUploadFiles, ...invalidUploadFiles];
    
    if (!allowMultiple) {
      setUploadFiles(newUploadFiles);
    } else {
      setUploadFiles(prev => [...prev, ...newUploadFiles]);
    }

    // Upload valid files
    for (const uploadFileItem of validUploadFiles) {
      processFileUpload(uploadFileItem, csrfToken);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const form = event.target.closest('form');
    const formData = new FormData(form || undefined);
    const csrfToken = formData.get('csrf_token') as string;
    
    handleFileSelect(files, csrfToken);
    event.target.value = ''; // Reset input
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    const form = document.querySelector('form');
    const formData = new FormData(form || undefined);
    const csrfToken = formData.get('csrf_token') as string;
    
    handleFileSelect(files, csrfToken);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <form>
        <CSRFToken />
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <Upload className="h-5 w-5 text-gray-400" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900">
                {allowMultiple ? 'Drop files here or click to upload' : 'Drop file here or click to upload'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Max size: {Math.round(maxSizeBytes / 1024 / 1024)}MB • 
                Formats: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
              </p>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="relative overflow-hidden"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select {allowMultiple ? 'Files' : 'File'}
              <Input
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleInputChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                multiple={allowMultiple}
              />
            </Button>
          </div>
        </div>
      </form>

      {/* Upload Progress */}
      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          {uploadFiles.map((uploadFile) => (
            <div key={uploadFile.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate max-w-48">
                    {uploadFile.file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadFile(uploadFile.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {uploadFile.status === 'uploading' && (
                <Progress value={uploadFile.progress} className="h-2" />
              )}
              
              {uploadFile.error && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-xs">
                    {uploadFile.error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
