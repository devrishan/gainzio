"use client";

import { LogOut, Flame, Trophy, Star, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { maskUserId } from "@/utils/maskPhone";

interface Achievement {
    id: string;
    name: string;
    icon: React.ElementType;
    unlocked: boolean;
}

interface ProfilePageProps {
    user: {
        userId: string;
        name: string;
        avatarUrl?: string;
        streakDays: number;
    };
    onLogout: () => void;
}

export const ProfilePage = ({ user, onLogout }: ProfilePageProps) => {
    const achievements: Achievement[] = [
        { id: "1", name: "Early Bird", icon: Star, unlocked: true },
        { id: "2", name: "Big Spender", icon: Trophy, unlocked: false },
        { id: "3", name: "Protector", icon: Shield, unlocked: true },
        { id: "4", name: "Sharpshooter", icon: Flame, unlocked: false },
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-[#0575E6] shadow-[0_0_20px_rgba(5,117,230,0.3)]">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="bg-[#1A1A1A] text-white">
                        {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#AAAAAA] text-sm">ID:</span>
                        <code className="text-[#0575E6] bg-[#0575E6]/10 px-2 py-0.5 rounded text-sm font-mono">
                            {maskUserId(user.userId)}
                        </code>
                    </div>
                </div>
            </div>

            {/* Streak Card */}
            <Card className="bg-gradient-to-r from-[#111111] to-[#1A1A1A] border border-white/5 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-[#AAAAAA] font-medium text-sm mb-1">Current Streak</p>
                    <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                        {user.streakDays} <span className="text-lg font-normal text-[#AAAAAA]">Days</span>
                    </h3>
                    <p className="text-xs text-[#00F260] mt-1">Keep it up to earn bonus coins!</p>
                </div>
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#FF4D4D] to-[#F9CB28] flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Flame className="h-8 w-8 text-white fill-white animate-pulse" />
                </div>
            </Card>

            {/* Achievements */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                    {achievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                            <Card
                                key={achievement.id}
                                className={`p-4 border-none flex flex-col items-center justify-center gap-2 text-center transition-colors ${achievement.unlocked ? 'bg-[#1A1A1A]' : 'bg-[#111111] opacity-50 grayscale'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-[#00F260]/10 text-[#00F260]' : 'bg-white/5 text-[#AAAAAA]'}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <span className={`text-sm font-medium ${achievement.unlocked ? 'text-white' : 'text-[#AAAAAA]'}`}>
                                    {achievement.name}
                                </span>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Logout Button */}
            <Button
                variant="ghost"
                className="w-full text-[#FF4D4D] hover:text-[#FF4D4D] hover:bg-[#FF4D4D]/10 justify-start h-12 text-base"
                onClick={onLogout}
            >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
            </Button>
        </div>
    );
};
