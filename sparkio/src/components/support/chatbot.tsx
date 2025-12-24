"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const quickHelp = [
  { label: "How to Refer?", response: "Share your referral link with friends. When they sign up and verify, you earn rewards!" },
  { label: "Upload Proof", response: "Go to your dashboard and click 'Upload Proof' to submit verification documents." },
  { label: "Withdraw Help", response: "You need a minimum of ₹100 to withdraw. Go to Wallet → Withdraw and enter your UPI details." },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm here to help. Choose a topic or ask me anything.",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");

  const handleQuickHelp = (response: string) => {
    const botMsg: Message = {
      id: Date.now().toString(),
      text: response,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate ticket submission
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thanks for reaching out! Your query has been sent to our support team. We'll get back to you soon.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      toast.success("Support ticket created");
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 shadow-lg",
          "hover:scale-110 transition-transform duration-200",
          "bg-primary hover:bg-primary/90",
          isOpen && "hidden"
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-md border-border bg-card shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
              <h3 className="font-semibold text-primary-foreground">Earniq Support</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="h-80 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex", msg.isBot ? "justify-start" : "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                      msg.isBot
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Quick Help Buttons */}
          <div className="border-t border-border p-3">
            <p className="mb-2 text-xs text-muted-foreground">Quick Help:</p>
            <div className="flex flex-wrap gap-2">
              {quickHelp.map((help) => (
                <Button
                  key={help.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickHelp(help.response)}
                  className="text-xs"
                >
                  {help.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your question..."
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
