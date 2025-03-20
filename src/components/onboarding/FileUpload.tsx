
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  accept?: string;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  filePreview: string | null;
  maxSizeMB?: number;
  label: string;
  description: string;
  buttonText: string;
  resetUpload: () => void;
}

export function FileUpload({
  onFileUpload,
  accept = "image/*",
  isUploading,
  uploadProgress,
  uploadError,
  filePreview,
  maxSizeMB = 5,
  label,
  description,
  buttonText,
  resetUpload
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-2">{label}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      
      {!filePreview ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-input'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium mb-1">Drop your file here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              {accept.includes('image') ? 'JPG, PNG or WebP' : 'PDF'} (max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border">
          {accept.includes('image') ? (
            <img 
              src={filePreview} 
              alt="Preview" 
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-muted flex items-center justify-center">
              <div className="flex flex-col items-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">File uploaded successfully</span>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <Button 
              size="icon" 
              variant="destructive" 
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs font-medium flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-1 text-green-400" />
            Uploaded successfully
          </div>
        </div>
      )}
      
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {uploadError && (
        <p className="mt-2 text-sm text-destructive">{uploadError}</p>
      )}
    </div>
  );
}
