"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileText, Link as LinkIcon, Upload } from "lucide-react";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  description: string;
  reward_coins: number;
  reward_money: number;
  reward_xp: number;
  requires_product_proof: boolean;
}

interface UserProduct {
  id: number;
  product_name: string;
  order_id: string;
}

interface TaskSubmissionFormProps {
  task: Task;
  userProducts?: UserProduct[];
  onSuccess?: () => void;
}

export function TaskSubmissionForm({ task, userProducts = [], onSuccess }: TaskSubmissionFormProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    user_product_id: "",
    proof_text: "",
    proof_link: "",
    proof_notes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/member/submit-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: task.id,
          user_product_id: formData.user_product_id ? parseInt(formData.user_product_id) : null,
          proof_text: formData.proof_text || null,
          proof_link: formData.proof_link || null,
          proof_notes: formData.proof_notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit task");
      }

      toast({
        title: "Task Submitted",
        description: "Your submission is pending review by our team.",
      });

      setFormData({
        user_product_id: "",
        proof_text: "",
        proof_link: "",
        proof_notes: "",
      });
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit task",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Submit Task</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Task: {task.title}</DialogTitle>
          <DialogDescription>
            Provide proof of completion to earn rewards: ₹{task.reward_money} • {task.reward_coins} coins • {task.reward_xp} XP
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {task.requires_product_proof && userProducts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="product">Product (Required)</Label>
              <Select
                value={formData.user_product_id}
                onValueChange={(value) => setFormData({ ...formData, user_product_id: value })}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select your product" />
                </SelectTrigger>
                <SelectContent>
                  {userProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.product_name} - Order #{product.order_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                This task requires proof of product ownership
              </p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium">Proof of Completion</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text Proof
                </CardTitle>
                <CardDescription>Describe what you did to complete the task</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="E.g., Posted a review on Amazon with order #12345"
                  value={formData.proof_text}
                  onChange={(e) => setFormData({ ...formData, proof_text: e.target.value })}
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Link Proof
                </CardTitle>
                <CardDescription>Share a link to your review, post, or screenshot</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  type="url"
                  placeholder="https://example.com/your-review"
                  value={formData.proof_link}
                  onChange={(e) => setFormData({ ...formData, proof_link: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Additional Notes
                </CardTitle>
                <CardDescription>Any additional information</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Optional: Add any extra details about your submission"
                  value={formData.proof_notes}
                  onChange={(e) => setFormData({ ...formData, proof_notes: e.target.value })}
                  rows={2}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
