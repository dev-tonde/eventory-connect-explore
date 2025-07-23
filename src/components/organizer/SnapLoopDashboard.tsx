import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, 
  X, 
  Eye, 
  Download, 
  QrCode, 
  Share2, 
  Camera,
  Clock,
  Users,
  Image
} from "lucide-react";
import QRCode from "qrcode";

interface SnapLoopDashboardProps {
  eventId: string;
}

interface SnapLoopUpload {
  id: string;
  image_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
  approved: boolean;
  file_size: number | null;
}

export function SnapLoopDashboard({ eventId }: SnapLoopDashboardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<SnapLoopUpload | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const { data: uploads, isLoading } = useQuery({
    queryKey: ["snaploop-dashboard", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("snaploop_uploads")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SnapLoopUpload[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ uploadId, approved }: { uploadId: string; approved: boolean }) => {
      const { error } = await supabase
        .from("snaploop_uploads")
        .update({ 
          approved,
          approved_at: approved ? new Date().toISOString() : null,
          approved_by: approved ? (await supabase.auth.getUser()).data.user?.id : null
        })
        .eq("id", uploadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snaploop-dashboard", eventId] });
      toast({
        title: "Updated successfully",
        description: "Photo status has been updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating photo:", error);
      toast({
        title: "Error",
        description: "Failed to update photo status.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      const upload = uploads?.find(u => u.id === uploadId);
      if (!upload) return;

      // Delete from storage
      const fileName = upload.image_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from("snaploop-uploads")
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from("snaploop_uploads")
        .delete()
        .eq("id", uploadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["snaploop-dashboard", eventId] });
      toast({
        title: "Photo deleted",
        description: "Photo has been permanently removed.",
      });
    },
    onError: (error) => {
      console.error("Error deleting photo:", error);
      toast({
        title: "Error",
        description: "Failed to delete photo.",
        variant: "destructive",
      });
    },
  });

  const generateQRCode = async () => {
    try {
      const uploadUrl = `${window.location.origin}/snaploop/upload?eventId=${eventId}`;
      const qrDataUrl = await QRCode.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    }
  };

  const copyUploadLink = () => {
    const uploadUrl = `${window.location.origin}/snaploop/upload?eventId=${eventId}`;
    navigator.clipboard.writeText(uploadUrl);
    toast({
      title: "Link copied!",
      description: "Upload link has been copied to clipboard.",
    });
  };

  const downloadQRCode = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `snaploop-qr-${eventId}.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingUploads = uploads?.filter(u => !u.approved) || [];
  const approvedUploads = uploads?.filter(u => u.approved) || [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Photos</p>
                <p className="text-2xl font-bold">{uploads?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingUploads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedUploads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-2xl font-bold">
                  {new Set(uploads?.map(u => u.uploaded_by)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code and Upload Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Guest Upload Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button onClick={generateQRCode}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>SnapLoop Upload QR Code</DialogTitle>
                </DialogHeader>
                <div className="text-center space-y-4">
                  {qrCodeUrl && (
                    <>
                      <img src={qrCodeUrl} alt="Upload QR Code" className="mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Guests can scan this QR code to upload photos
                      </p>
                      <Button onClick={downloadQRCode} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download QR Code
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={copyUploadLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Copy Upload Link
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share the QR code or upload link with guests so they can easily upload their photos.
          </p>
        </CardContent>
      </Card>

      {/* Pending Uploads */}
      {pendingUploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Approval ({pendingUploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUploads.map((upload) => (
                <Card key={upload.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={upload.thumbnail_url || upload.image_url}
                      alt={upload.caption || "Uploaded photo"}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      Pending
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    {upload.caption && (
                      <p className="text-sm mb-2 line-clamp-2">{upload.caption}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>by {upload.uploaded_by || "Anonymous"}</span>
                      <span>{new Date(upload.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({ uploadId: upload.id, approved: true })}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedImage(upload)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteMutation.mutate(upload.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Uploads */}
      {approvedUploads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Approved Photos ({approvedUploads.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {approvedUploads.map((upload) => (
                <Card key={upload.id} className="overflow-hidden">
                  <div className="aspect-square relative cursor-pointer" onClick={() => setSelectedImage(upload)}>
                    <img
                      src={upload.thumbnail_url || upload.image_url}
                      alt={upload.caption || "Approved photo"}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2" variant="default">
                      Approved
                    </Badge>
                  </div>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{upload.uploaded_by || "Anonymous"}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => approveMutation.mutate({ uploadId: upload.id, approved: false })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No uploads state */}
      {(!uploads || uploads.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Camera className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No uploads yet</h3>
            <p className="text-muted-foreground mb-4">
              Share the upload link or QR code with your guests to start collecting photos.
            </p>
            <Button onClick={copyUploadLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Copy Upload Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Photo Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.caption || "Photo"}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              <div className="flex items-center justify-between">
                <div>
                  {selectedImage.caption && (
                    <p className="text-sm mb-2">{selectedImage.caption}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>by {selectedImage.uploaded_by || "Anonymous"}</span>
                    <span>•</span>
                    <span>{new Date(selectedImage.created_at).toLocaleDateString()}</span>
                    {selectedImage.file_size && (
                      <>
                        <span>•</span>
                        <span>{(selectedImage.file_size / (1024 * 1024)).toFixed(1)}MB</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!selectedImage.approved && (
                    <Button
                      onClick={() => {
                        approveMutation.mutate({ uploadId: selectedImage.id, approved: true });
                        setSelectedImage(null);
                      }}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate(selectedImage.id);
                      setSelectedImage(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}