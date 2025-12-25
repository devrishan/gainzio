"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const productSuggestionSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(255),
  platform: z.string().min(1, "Platform is required"),
  category: z.string().optional(),
  amount: z.string().optional(),
  orderId: z.string().optional(),
});

type ProductSuggestionFormValues = z.infer<typeof productSuggestionSchema>;

interface ProductSuggestionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductSuggestionForm({ onSuccess, onCancel }: ProductSuggestionFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductSuggestionFormValues>({
    resolver: zodResolver(productSuggestionSchema),
    defaultValues: {
      platform: "",
    },
  });

  const platform = watch("platform");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductSuggestionFormValues) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("productName", data.productName);
      formData.append("platform", data.platform);
      if (data.category) formData.append("category", data.category);
      if (data.amount) formData.append("amount", data.amount);
      if (data.orderId) formData.append("orderId", data.orderId);

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/member/products/suggest", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit product suggestion");
      }

      toast({
        title: "Product suggested successfully",
        description: "Your suggestion is under review.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest a Product</DialogTitle>
          <DialogDescription>
            Share products you&apos;ve purchased to help us create tasks for others.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="productName"
              {...register("productName")}
              placeholder="e.g., iPhone 15 Pro"
            />
            {errors.productName && (
              <p className="text-sm text-destructive">{errors.productName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">
              Platform <span className="text-destructive">*</span>
            </Label>
            <Select value={platform} onValueChange={(value) => setValue("platform", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="flipkart">Flipkart</SelectItem>
                <SelectItem value="myntra">Myntra</SelectItem>
                <SelectItem value="nykaa">Nykaa</SelectItem>
                <SelectItem value="swiggy">Swiggy</SelectItem>
                <SelectItem value="zomato">Zomato</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-sm text-destructive">{errors.platform.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              {...register("category")}
              placeholder="e.g., Electronics, Fashion, Food"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) (Optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID (Optional)</Label>
              <Input
                id="orderId"
                {...register("orderId")}
                placeholder="Order reference number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="files">Proof Files (Optional)</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Upload order confirmation, receipt, or product images (max 10MB per file)
            </p>

            {files.length > 0 && (
              <div className="space-y-2 mt-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Submitting..." : "Submit Suggestion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

