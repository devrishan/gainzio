"use client";

import React, { useRef, useState, useEffect } from "react";
import {
    PanelLeftClose, PanelLeft, Settings2, Sparkles, Send,
    Bot, Paperclip, ChevronRight, History, MoreHorizontal, Menu
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface AIChatShellProps {
    children?: React.ReactNode;
}

export function AIChatShell({ children }: AIChatShellProps) {
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/member/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg }),
            });

            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.text || "Sorry, I couldn't process that.",
                action: data.action
            }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI service." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
            {/* LEFT SIDEBAR: History */}
            <AnimatePresence mode="wait">
                {isLeftSidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-r border-white/5 bg-muted/10 hidden md:flex flex-col glass-morphism"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <History className="w-4 h-4" /> History
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsLeftSidebarOpen(false)}>
                                <PanelLeftClose className="w-4 h-4" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-2">
                            <div className="space-y-2">
                                {["Project Alpha Strategy", "Marketing Copy: Q3", "React Component Fixes", "General Chat"].map((chat, i) => (
                                    <Button key={i} variant="ghost" className="w-full justify-start text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-white/5">
                                        <span className="truncate">{chat}</span>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t border-white/5">
                            <Button variant="outline" className="w-full justify-start gap-2 border-white/10 hover:bg-white/5">
                                <Sparkles className="w-4 h-4 text-primary" /> New Chat
                            </Button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* MAIN CANVAS */}
            <main className="flex-1 flex flex-col min-w-0 relative">
                {/* Header Toolbar */}
                <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        {!isLeftSidebarOpen && (
                            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setIsLeftSidebarOpen(true)}>
                                <PanelLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {/* Mobile Sidebar Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="w-4 h-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0 bg-transparent border-none">
                                <div className="h-full flex flex-col bg-background/95 backdrop-blur-xl border-r border-white/10">
                                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <History className="w-4 h-4" /> History
                                        </span>
                                    </div>
                                    <ScrollArea className="flex-1 p-2">
                                        <div className="space-y-2">
                                            {["Project Alpha Strategy", "Marketing Copy: Q3", "React Component Fixes", "General Chat"].map((chat, i) => (
                                                <Button key={i} variant="ghost" className="w-full justify-start text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-white/5">
                                                    <span className="truncate">{chat}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                    <div className="p-4 border-t border-white/5">
                                        <Button variant="outline" className="w-full justify-start gap-2 border-white/10 hover:bg-white/5">
                                            <Sparkles className="w-4 h-4 text-primary" /> New Chat
                                        </Button>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                            <Bot className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Gainzio Gemini Ultra</span>
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("text-muted-foreground hover:text-foreground", isRightPanelOpen && "bg-accent/50 text-accent-foreground")}
                        onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                    >
                        <Settings2 className="w-5 h-5" />
                    </Button>
                </header>

                {/* Chat Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">How can I help you today?</h2>
                                <p className="max-w-md">I'm connected to your live dashboard data. Ask me about your earnings, rank, or tasks!</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-4 max-w-3xl mx-auto",
                                        msg.role === 'user' ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                            <Bot className="w-5 h-5 text-primary" />
                                        </div>
                                    )}
                                    <div className={cn(
                                        "rounded-2xl p-4 shadow-sm max-w-[80%]",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted/50 border border-white/10 rounded-tl-none"
                                    )}>
                                        <div className="whitespace-pre-wrap">{msg.content}</div>
                                        {msg.action && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 gap-2 bg-background/50 border-white/10 hover:bg-background"
                                                onClick={() => window.location.href = msg.action!.url}
                                            >
                                                {msg.action.label} <ChevronRight className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex gap-4 max-w-3xl mx-auto">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <div className="bg-muted/50 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-background/50 backdrop-blur-md border-t border-white/5">
                        <div className="max-w-3xl mx-auto relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="relative flex items-end gap-2 bg-zinc-950/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl"
                            >
                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-xl h-10 w-10">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[2.5rem] py-2 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                                    placeholder="Message Gainzio AI..."
                                    rows={1}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            {/* RIGHT PANEL: Settings */}
            <AnimatePresence mode="wait">
                {isRightPanelOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="border-l border-white/5 bg-muted/10 hidden xl:block glass-morphism"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-sm font-medium">Model Configuration</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsRightPanelOpen(false)}>
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parameters</h4>
                                {/* Mock sliders */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Temperature</span>
                                        <span className="text-primary">0.7</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-[70%]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Max Length</span>
                                        <span className="text-primary">2048</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[40%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
