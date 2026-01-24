"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ShieldCheck, Ban, Lock, Unlock, Loader2, Play } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or useToast is available
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MemberActionsProps {
    userId: string;
    userRole: string;
    isLocked?: boolean;
    verificationLevel?: number;
}

export function MemberActions({ userId, userRole, isLocked = false, verificationLevel = 0 }: MemberActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);
    const [pendingAction, setPendingAction] = useState<string | null>(null);

    const handleAction = async (action: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/members/${userId}/action`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            if (!res.ok) throw new Error("Action failed");

            toast.success(`User ${action.toLowerCase()}ed successfully`);
            router.refresh();
        } catch (error) {
            toast.error("Failed to update user status");
            console.error(error);
        } finally {
            setLoading(false);
            setOpenAlert(false);
            setPendingAction(null);
        }
    };

    const confirmAction = (action: string) => {
        setPendingAction(action);
        setOpenAlert(true);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => router.push(`/admin/members/${userId}`)}
                        className="cursor-pointer"
                    >
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    {verificationLevel < 3 && (
                        <DropdownMenuItem
                            onClick={() => confirmAction("VERIFY")}
                            className="text-green-600 focus:text-green-600 cursor-pointer"
                        >
                            <ShieldCheck className="mr-2 h-4 w-4" /> Mark Verified
                        </DropdownMenuItem>
                    )}

                    {isLocked ? (
                        <DropdownMenuItem
                            onClick={() => confirmAction("UNSUSPEND")}
                            className="cursor-pointer"
                        >
                            <Unlock className="mr-2 h-4 w-4" /> Unsuspend
                        </DropdownMenuItem>
                    ) : (
                        <DropdownMenuItem
                            onClick={() => confirmAction("SUSPEND")}
                            className="text-orange-600 focus:text-orange-600 cursor-pointer"
                        >
                            <Lock className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onClick={() => confirmAction("BAN")}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                        <Ban className="mr-2 h-4 w-4" /> Ban User
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will {pendingAction?.toLowerCase()} this user.
                            {pendingAction === 'BAN' && " They will lose access to their account permanently."}
                            {pendingAction === 'SUSPEND' && " They will be locked out for 7 days."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                if (pendingAction) handleAction(pendingAction);
                            }}
                            className={pendingAction === 'BAN' ? "bg-red-600 hover:bg-red-700" : ""}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
