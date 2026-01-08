"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, X, User, Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react"; // Using standard next-auth for frontend
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    suggestedActions?: { label: string; action: string }[];
}

export function AIChatShell() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm Gainzio AI. How can I help you earn today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/member/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content }),
            });

            if (!res.ok) throw new Error("Failed to fetch");

            const data = await res.json();

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant", // data.role might be from API
                content: data.content,
                timestamp: new Date(),
                suggestedActions: data.suggestedActions,
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Chat Error", error);
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
            // Refocus input for speed
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto w-[380px] sm:w-[420px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] rounded-3xl glass-morphism border border-white/10 shadow-2xl flex flex-col overflow-hidden bg-black/40 backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-full">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-foreground">Gainzio AI</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-white/10 rounded-full"
                                onClick={() => setIsOpen(false)}
                            >
                                <ChevronDown className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6">
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex gap-3",
                                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-white/10",
                                            msg.role === "user" ? "bg-purple-500/20" : "bg-primary/20"
                                        )}>
                                            {msg.role === "user" ? (
                                                <User className="w-4 h-4 text-purple-400" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-primary" />
                                            )}
                                        </div>

                                        {/* Bubble */}
                                        <div className={cn(
                                            "rounded-2xl p-3.5 text-sm max-w-[85%] shadow-sm",
                                            msg.role === "user"
                                                ? "bg-purple-600 text-white rounded-tr-sm"
                                                : "bg-muted/50 border border-white/5 text-foreground rounded-tl-sm"
                                        )}>
                                            {/* Content render */}
                                            <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>

                                            {/* Suggested Actions */}
                                            {msg.suggestedActions && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {msg.suggestedActions.map((action, idx) => (
                                                        <Button
                                                            key={idx}
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs bg-black/20 border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                                                            onClick={() => {
                                                                if (action.action.startsWith("NAVIGATE:")) {
                                                                    window.location.href = action.action.split(":")[1];
                                                                } else {
                                                                    setInput(action.label); // Or handle command
                                                                }
                                                            }}
                                                        >
                                                            {action.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}

                                            <span className="text-[10px] opacity-50 block mt-1 text-right">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-white/10">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="bg-muted/30 border border-white/5 rounded-2xl p-3.5 rounded-tl-sm flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-muted/20 border-t border-white/5 backdrop-blur-md shrink-0">
                            <div className="relative flex items-end gap-2 bg-black/20 border border-white/10 rounded-2xl p-1.5 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                                <Textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about tasks, earnings..."
                                    className="min-h-[44px] max-h-32 w-full resize-none border-0 bg-transparent focus-visible:ring-0 px-3 py-2.5 text-sm placeholder:text-muted-foreground/50"
                                    rows={1}
                                />
                                <Button
                                    size="icon"
                                    className={cn(
                                        "h-9 w-9 rounded-xl shrink-0 transition-all",
                                        input.trim() ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
                                    )}
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-center text-muted-foreground/40 mt-2">
                                Gainzio AI can make mistakes. Verify important info.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-2xl shadow-primary/30 flex items-center justify-center border border-white/20 relative group"
            >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <ChevronDown className="w-7 h-7 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                        >
                            <Sparkles className="w-7 h-7 text-white fill-white/20" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white">
                        1
                    </span>
                )}
            </motion.button>
        </div>
    );
}
