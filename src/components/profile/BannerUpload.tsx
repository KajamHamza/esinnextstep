
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileUpload } from '@/components/onboarding/FileUpload';

interface BannerUploadProps {
  handleBannerUpload: (file: File) => Promise<void>;
  uploadingBanner: boolean;
  bannerProgress: number;
  bannerError: string | null;
  bannerUrl: string | null;
  resetBannerUpload: () => void;
}

export const BannerUpload = ({
  handleBannerUpload,
  uploadingBanner,
  bannerProgress,
  bannerError,
  bannerUrl,
  resetBannerUpload
}: BannerUploadProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Banner</CardTitle>
        <CardDescription>Upload a banner image for your profile (recommended size: 1500x500)</CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          onFileUpload={handleBannerUpload}
          accept="image/*"
          isUploading={uploadingBanner}
          uploadProgress={bannerProgress}
          uploadError={bannerError}
          filePreview={bannerUrl}
          maxSizeMB={5}
          label="Profile Banner"
          description="Choose a banner image for your profile"
          buttonText="Upload Banner"
          resetUpload={resetBannerUpload}
        />
      </CardContent>
    </Card>
  );
};
