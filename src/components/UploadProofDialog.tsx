import { useState } from "react";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export const UploadProofDialog = () => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      setOpen(false);
      toast({
        title: "Proof verified — you&apos;re on a roll.",
        description: "Your referral has been added and is being reviewed.",
      });
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full glow-sm h-11 sm:h-10 text-sm sm:text-base" size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Upload Proof
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card max-w-[calc(100vw-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg text-foreground">Submit Referral Proof</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Upload proof of your referral to earn rewards instantly.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="name" className="text-sm text-foreground">
              Referred Person&apos;s Name
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              required
              className="border-border bg-muted h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="screenshot" className="text-sm text-foreground">
              Screenshot/Proof
            </Label>
            <Input
              id="screenshot"
              type="file"
              accept="image/*"
              required
              className="border-border bg-muted h-10 text-sm"
            />
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Upload a clear screenshot showing the completed referral
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-sm sm:text-base"
            disabled={uploading}
          >
            {uploading ? "Verifying..." : "Submit for Verification"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
