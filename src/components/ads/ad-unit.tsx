"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface Ad {
    id: string;
    imageUrl: string;
    targetUrl: string;
    name: string;
}

interface AdUnitProps {
    zoneSlug: string;
    className?: string;
}

export function AdUnit({ zoneSlug, className }: AdUnitProps) {
    const [ad, setAd] = useState<Ad | null>(null);
    const [loading, setLoading] = useState(true);
    const hasLoggedView = useRef(false);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const res = await fetch(`/api/ads/serve?zoneSlug=${zoneSlug}`);
                const data = await res.json();
                if (data.ad) {
                    setAd(data.ad);
                }
            } catch (error) {
                console.error("Failed to load ad", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [zoneSlug]);

    useEffect(() => {
        if (ad && !hasLoggedView.current) {
            // Log impression
            fetch("/api/ads/track", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "VIEW", campaignId: ad.id }),
            }).catch(console.error);
            hasLoggedView.current = true;
        }
    }, [ad]);

    const handleClick = () => {
        if (!ad) return;

        // Log click
        fetch("/api/ads/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "CLICK", campaignId: ad.id }),
        }).catch(console.error);

        // Open target URL
        window.open(ad.targetUrl, "_blank");
    };

    if (loading) return <div className={`h-24 bg-muted animate-pulse rounded-lg ${className}`} />;
    if (!ad) return null;

    return (
        <div
            onClick={handleClick}
            className={`relative cursor-pointer overflow-hidden rounded-lg group ${className}`}
        >
            <div className="relative w-full h-full min-h-[100px]">
                <Image
                    src={ad.imageUrl}
                    alt={ad.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute top-1 right-1 bg-black/50 text-[10px] text-white px-1 rounded">
                    Ad
                </div>
            </div>
        </div>
    );
}
