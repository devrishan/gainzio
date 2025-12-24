"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface SparkEvent {
  id: string;
  type: string;
  message: string;
  data: any;
  createdAt: string;
}

export function SparkWall() {
  const [events, setEvents] = useState<SparkEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Connect to SSE endpoint
    const eventSource = new EventSource("/api/sse/spark");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          console.log("Connected to Spark Wall");
        } else if (data.type === "event") {
          setEvents((prev) => {
            // Avoid duplicates
            if (prev.find((e) => e.id === data.id)) {
              return prev;
            }
            // Add new event at the top, keep only last 100
            return [data, ...prev].slice(0, 100);
          });
        }
      } catch (err) {
        console.error("Error parsing SSE message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      setError("Connection lost. Reconnecting...");
      setIsConnected(false);
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
    };
  }, []);

  if (error && events.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">Connecting to Spark Wall...</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Spark Wall</CardTitle>
          {isConnected && (
            <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              Live
            </span>
          )}
        </div>
        <CardDescription>Real-time feed of user achievements and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-all hover:bg-muted/50"
              >
                <div className="rounded-full bg-primary/10 p-1.5 flex-shrink-0">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
