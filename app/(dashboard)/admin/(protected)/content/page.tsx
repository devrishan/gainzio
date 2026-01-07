"use client";

import { motion } from "framer-motion";
import { BillboardManager } from "@/components/admin/billboard-manager";
import { StoryPublisher } from "@/components/admin/story-publisher";

export default function ContentPage() {
    return (
        <div className="max-w-6xl space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">
                        The Studio
                    </h1>
                    <p className="text-neutral-400">Content management and engagement tools.</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* 1. Billboard (Wide) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <BillboardManager />
                </motion.div>

                {/* 2. Story Publisher (Narrow) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <StoryPublisher />
                </motion.div>

            </div>
        </div>
    );
}
