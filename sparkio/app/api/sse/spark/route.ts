import { NextRequest } from 'next/server';
import { getRecentSparkEvents } from '@/lib/spark-events';
import { prisma } from '@/lib/prisma';
import { isFeatureEnabled } from '@/lib/feature-flags';

/**
 * Server-Sent Events endpoint for real-time Spark Wall feed
 */
export async function GET(request: NextRequest) {
  // Check if Spark Wall is enabled globally
  const sparkWallEnabled = await isFeatureEnabled('SPARK_WALL_ENABLED');
  if (!sparkWallEnabled) {
    return new Response(
      JSON.stringify({ error: 'Spark Wall feature is disabled' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      const send = (data: string) => {
        controller.enqueue(encoder.encode(data));
      };

      send(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to Spark Wall' })}\n\n`);

      // Send recent events (public only)
      try {
        const recentEvents = await getRecentSparkEvents(20, true); // publicOnly = true
        for (const event of recentEvents) {
          send(`data: ${JSON.stringify({ type: 'event', ...event })}\n\n`);
        }
      } catch (error) {
        console.error('Error sending initial events:', error);
      }

      // Poll for new events
      let lastEventId: string | null = null;
      const pollInterval = setInterval(async () => {
        try {
          const where: any = {};

          if (lastEventId) {
            where.id = { gt: lastEventId };
          }

          const newEvents = await prisma.sparkEvent.findMany({
            where: {
              ...where,
              isPublic: true, // Only public events in SSE stream
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          });

          for (const event of newEvents.reverse()) {
            // Send oldest first
            send(`data: ${JSON.stringify({ type: 'event', ...event })}\n\n`);
            lastEventId = event.id;
          }
        } catch (error) {
          console.error('Error polling for new events:', error);
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(pollInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
