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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

const convertSchema = z.object({
  taskTitle: z.string().min(1, "Task title is required").max(255),
  taskDescription: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  rewardAmount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  rewardCoins: z.string().optional().default("0"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Easy"),
  maxSubmissions: z.string().optional(),
  expiresAt: z.string().optional(),
});

type ConvertFormValues = z.infer<typeof convertSchema>;

interface ConvertSuggestionDialogProps {
  suggestion: {
    id: string;
    productName: string;
    platform: string;
    category: string | null;
    amount: number | null;
  };
  onConvert: (data: {
    taskTitle: string;
    taskDescription: string;
    categoryId: string;
    rewardAmount: number;
    rewardCoins: number;
    difficulty: "Easy" | "Medium" | "Hard";
    maxSubmissions?: number;
    expiresAt?: string;
  }) => void;
  onCancel: () => void;
}

async function fetchCategories(): Promise<Array<{ id: string; name: string; slug: string }>> {
  const response = await fetch('/api/tasks/categories', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const data = await response.json();
  return data.categories || [];
}

export function ConvertSuggestionDialog({
  suggestion,
  onConvert,
  onCancel,
}: ConvertSuggestionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["task-categories"],
    queryFn: fetchCategories,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ConvertFormValues>({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      taskTitle: `Buy ${suggestion.productName} from ${suggestion.platform}`,
      taskDescription: `Purchase ${suggestion.productName} from ${suggestion.platform}${suggestion.category ? ` (${suggestion.category})` : ""} and upload proof.`,
      rewardAmount: suggestion.amount ? suggestion.amount.toString() : "50",
      rewardCoins: "100",
      difficulty: "Easy",
    },
  });

  const onSubmit = async (data: ConvertFormValues) => {
    setIsSubmitting(true);
    try {
      onConvert({
        taskTitle: data.taskTitle,
        taskDescription: data.taskDescription,
        categoryId: data.categoryId,
        rewardAmount: parseFloat(data.rewardAmount),
        rewardCoins: parseInt(data.rewardCoins || "0"),
        difficulty: data.difficulty,
        maxSubmissions: data.maxSubmissions ? parseInt(data.maxSubmissions) : undefined,
        expiresAt: data.expiresAt || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Convert to Task</DialogTitle>
          <DialogDescription>
            Create a task from the product suggestion: <strong>{suggestion.productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">
              Task Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="taskTitle"
              {...register("taskTitle")}
              placeholder="e.g., Buy iPhone 15 Pro from Amazon"
            />
            {errors.taskTitle && (
              <p className="text-sm text-destructive">{errors.taskTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskDescription">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="taskDescription"
              {...register("taskDescription")}
              placeholder="Describe what users need to do..."
              rows={4}
            />
            {errors.taskDescription && (
              <p className="text-sm text-destructive">{errors.taskDescription.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("categoryId", value)}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={watch("difficulty")}
                onValueChange={(value) => setValue("difficulty", value as "Easy" | "Medium" | "Hard")}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rewardAmount">
                Reward Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rewardAmount"
                type="number"
                step="0.01"
                {...register("rewardAmount")}
                placeholder="50.00"
              />
              {errors.rewardAmount && (
                <p className="text-sm text-destructive">{errors.rewardAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rewardCoins">Reward Coins</Label>
              <Input
                id="rewardCoins"
                type="number"
                {...register("rewardCoins")}
                placeholder="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxSubmissions">Max Submissions (Optional)</Label>
              <Input
                id="maxSubmissions"
                type="number"
                {...register("maxSubmissions")}
                placeholder="Unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...register("expiresAt")}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

