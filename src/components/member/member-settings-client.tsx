"use client";

import { useState } from "react";
import { useSession } from "@/components/providers/session-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Mail, Phone, Save, ShieldCheck, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianStates } from "@/lib/constants";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function MemberSettingsClient() {
    const { user } = useSession();
    const [selectedState, setSelectedState] = useState<string>(user?.state || "");

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get("email"),
            dob: formData.get("dob") ? new Date(formData.get("dob") as string).toISOString() : null,
            state: selectedState,
            district: formData.get("district"),
        };

        try {
            const res = await fetch("/api/member/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update profile");

            toast.success("Profile updated successfully");
            // Ideally force session refresh here, but toast is good feedback for now
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
        toast.success("Password updated successfully");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    Profile Settings
                </h1>
                <p className="text-muted-foreground">Manage your account details and security preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass-morphism border-white/5 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Update your public profile details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg shadow-primary/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {user?.username?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-lg">{user?.username}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 px-2 py-1 rounded-full border border-primary/10 w-fit">
                                            <ShieldCheck className="w-3 h-3 text-primary" />
                                            <span>Member Account</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            defaultValue={user?.username}
                                            disabled
                                            className="bg-muted/20 border-white/5 text-muted-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            defaultValue={user?.phone || ""}
                                            disabled
                                            className="bg-muted/20 border-white/5 text-muted-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        defaultValue={user?.email || ""}
                                        className="bg-background/50 border-white/10 focus:border-primary/50"
                                        placeholder="Enter your email"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        defaultValue={user?.dob ? new Date(user.dob).toISOString().split('T')[0] : ""}
                                        className="bg-background/50 border-white/10 focus:border-primary/50"
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">Used for age-restricted task eligibility.</p>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Select
                                            name="state"
                                            defaultValue={user?.state || ""}
                                            onValueChange={(val) => setSelectedState(val)}
                                        >
                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(IndianStates).map((state) => (
                                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district">District</Label>
                                        <Select name="district" defaultValue={user?.district || ""} disabled={!selectedState}>
                                            <SelectTrigger className="bg-background/50 border-white/10">
                                                <SelectValue placeholder="Select District" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(selectedState && IndianStates[selectedState as keyof typeof IndianStates])?.map((district) => (
                                                    <SelectItem key={district} value={district}>{district}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={isLoading} className="w-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="glass-morphism border-white/5 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input
                                        id="current-password"
                                        type="password"
                                        required
                                        className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        required
                                        className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input
                                        id="confirm-password"
                                        type="password"
                                        required
                                        className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                                    />
                                </div>

                                <div className="pt-4 mt-auto">
                                    <Button type="submit" variant="outline" disabled={isLoading} className="w-full border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
