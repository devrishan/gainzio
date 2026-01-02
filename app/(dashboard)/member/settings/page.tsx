"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const usernameSchema = z.object({
    username: z
        .string()
        .min(4, "Minimum 4 characters.")
        .max(20, "Maximum 20 characters.")
        .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, or underscores only."),
});

type FormValues = z.infer<typeof usernameSchema>;

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [isChecking, setIsChecking] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(usernameSchema),
        defaultValues: {
            username: "",
        },
    });

    // Set initial value once session is loaded
    useEffect(() => {
        if (session?.user?.username) {
            // @ts-expect-error - username is added to session in NextAuth config but typescript definition might be missing it in client type
            form.setValue("username", session.user.username);
        }
    }, [session, form]);

    const onSubmit = async (values: FormValues) => {
        // Don't submit if unchanged
        // @ts-expect-error
        if (values.username === session?.user?.username) {
            toast.info("No changes made.");
            return;
        }

        setIsChecking(true);
        try {
            const response = await fetch("/api/member/profile/update-username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: values.username }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to update.");
            }

            toast.success("Username updated.");
            // Force session update to reflect new username in UI
            await updateSession({ username: values.username });

        } catch (error) {
            const msg = error instanceof Error ? error.message : "Unable to update.";
            toast.error(msg);
            form.setError("username", { message: msg });
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">Manage your profile and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Username</CardTitle>
                        <CardDescription>
                            Your unique identity on Gainzio. You can change this once every 30 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="gainzio_user"
                                                        {...field}
                                                        disabled={isChecking}
                                                        className={form.formState.errors.username ? "border-destructive pr-10" : "pr-10"}
                                                    />
                                                    {/* Status Indicator inside input */}
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                                                        {isChecking ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : !form.formState.errors.username && field.value !== session?.user?.username && field.value.length >= 4 ? (
                                                            <span className="text-xs font-medium text-green-500">Looks good</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                Use letters, numbers, or underscores. 4–20 characters.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isChecking || !form.formState.isDirty}>
                                    {isChecking ? "Updating..." : "Save Changes"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
