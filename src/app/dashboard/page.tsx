"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) setUser(storedUser);
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold"
                >
                    Good Morning, {user || "Love"}
                </motion.h1>
                <p className="text-muted-foreground">Here's your summary for today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Placeholder Widgets */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Daily Mood</h3>
                    <p className="text-muted-foreground text-sm">How are you feeling?</p>
                    <div className="mt-4 flex gap-2">
                        {/* Will imply actual mood selection later */}
                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">😊</div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">😔</div>
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">😡</div>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                    <h3 className="font-semibold text-lg mb-2">Latest Photo</h3>
                    <div className="aspect-video bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground">
                        No photo today
                    </div>
                </div>
            </div>
        </div>
    );
}
