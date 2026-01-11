"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Loader2, Image as ImageIcon, RefreshCcw } from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    const [latestMemory, setLatestMemory] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) setUser(storedUser);
        fetchLatestMemory();
    }, []);

    const fetchLatestMemory = async () => {
        const { data } = await supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (data) setLatestMemory(data);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <header>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold font-outfit"
                >
                    Good Morning, {user || "Love"}
                </motion.h1>
                <p className="text-muted-foreground">Here's your summary for today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Mood Selection */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Daily Mood</h3>
                    <p className="text-muted-foreground text-sm">How are you feeling?</p>
                    <div className="mt-4 flex gap-2">
                        <button onClick={() => router.push('/dashboard/mood/happy')} className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-pointer" title="Happy">😊</button>
                        <button onClick={() => router.push('/dashboard/mood/sad')} className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-pointer" title="Sad">😔</button>
                        <button onClick={() => router.push('/dashboard/mood/angry')} className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-pointer" title="Angry">😡</button>
                    </div>
                </div>

                {/* Latest Photo Widget */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">Latest Photo</h3>
                        <button onClick={fetchLatestMemory} className="p-1 hover:bg-secondary rounded-full transition-colors" title="Refresh">
                            <RefreshCcw className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>
                    {loading ? (
                        <div className="aspect-video bg-secondary/30 rounded-xl flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : latestMemory ? (
                        <div className="aspect-video rounded-xl overflow-hidden relative group cursor-pointer">
                            <img
                                src={latestMemory.url}
                                alt={latestMemory.caption}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <p className="text-white text-sm font-medium line-clamp-1">{latestMemory.caption || "Untitled"}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground flex-col gap-2">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                            <span className="text-sm">No photos yet</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
