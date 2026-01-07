/**
 * Formats seconds into HH:MM:SS or "1d 2h" format.
 */
export function formatTimer(seconds: number): string {
    if (seconds <= 0) return "00:00:00";

    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
        if (hours > 0) {
            return `${days}d ${hours}h`;
        }
        return `${days}d`;
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}
