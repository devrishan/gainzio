"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TaskSubmissionDialogProps {
  taskId: string;
  taskTitle: string;
  taskType?: string; // Add taskType
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function TaskSubmissionDialog({ taskId, taskTitle, taskType, children, onSuccess }: TaskSubmissionDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofEndFile, setProofEndFile] = useState<File | null>(null); // State for second file
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofFile) {
      toast({
        title: "Proof required",
        description: "Please select a proof file to upload",
        variant: "destructive",
      });
      return;
    }

    if (taskType === "SOCIAL_MEDIA" && !proofEndFile) {
      toast({
        title: "End Proof required",
        description: "Please select the second screenshot (Proof of duration)",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("task_id", taskId);
      formData.append("proof", proofFile);
      if (proofEndFile) formData.append("proof_end", proofEndFile); // Append second file if exists
      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      const response = await fetch("/api/member/tasks/submit", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to submit task");
      }

      toast({
        title: "Task submitted successfully",
        description: "Your submission is under review. You'll be notified once it's processed.",
      });


      setOpen(false);
      setProofFile(null);
      setProofEndFile(null);
      setNotes("");

      // Invalidate tasks query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred while submitting the task",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="w-full gap-2">
            <Upload className="h-4 w-4" />
            Upload Proof
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-border bg-card max-w-[calc(100vw-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg text-foreground">Submit Task Proof</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Upload proof for: <strong>{taskTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof" className="text-sm text-foreground">
                {taskType === "SOCIAL_MEDIA" ? "Start Screenshot (Proof of posting)" : "Proof File"} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="proof"
                type="file"
                accept="image/*,video/*"
                required
                onChange={handleFileChange}
                className="border-border bg-muted h-10 text-sm"
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Upload main proof (max 10MB).
              </p>
              {proofFile && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="text-sm text-foreground flex-1 truncate">{proofFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setProofFile(null)}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {taskType === "SOCIAL_MEDIA" && (
              <div className="space-y-2">
                <Label htmlFor="proof_end" className="text-sm text-foreground">
                  End Screenshot (Proof of duration) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="proof_end"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setProofEndFile(file);
                  }}
                  className="border-border bg-muted h-10 text-sm"
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">
                  Upload screenshot after 20+ hours (max 10MB).
                </p>
                {proofEndFile && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <span className="text-sm text-foreground flex-1 truncate">{proofEndFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setProofEndFile(null)}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm text-foreground">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information about your submission..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-border bg-muted text-sm min-h-[100px]"
              disabled={uploading}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{notes.length}/1000 characters</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setProofFile(null);
                setProofEndFile(null);
                setNotes("");
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !proofFile || (taskType === 'SOCIAL_MEDIA' && !proofEndFile)}>
              {uploading ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

