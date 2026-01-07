"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Trash2, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type DiaryEntry = {
    id: string;
    date: string;
    content: string;
    author: string;
    created_at: string;
};

export default function DiaryPage() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [newEntry, setNewEntry] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [currentUser, setCurrentUser] = useState("Aami");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) {
            setCurrentUser(user);
            fetchEntries(user);
        }
    }, []);

    const fetchEntries = async (user: string) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('diary_entries')
            .select('*')
            .eq('author', user)
            .order('created_at', { ascending: false });

        if (data) setEntries(data);
        setLoading(false);
    };

    const saveEntry = async () => {
        if (!newEntry.trim()) return;

        const optimisticEntry: DiaryEntry = {
            id: "temp-" + Date.now(),
            date: new Date().toLocaleDateString(),
            content: newEntry,
            author: currentUser,
            created_at: new Date().toISOString(),
        };

        // Optimistic Update
        setEntries([optimisticEntry, ...entries]);
        setIsAdding(false);
        setNewEntry("");

        // DB Call
        const { data, error } = await supabase
            .from('diary_entries')
            .insert([{
                author: currentUser,
                content: optimisticEntry.content,
                date: optimisticEntry.date
            }])
            .select()
            .single();

        if (data) {
            // Replace temp entry
            setEntries(prev => prev.map(e => e.id === optimisticEntry.id ? data : e));
        } else {
            // Revert on error
            console.error("Failed to save", error);
            setEntries(prev => prev.filter(e => e.id !== optimisticEntry.id));
        }
    };

    const deleteEntry = async (id: string) => {
        if (!confirm("Delete this secret?")) return;

        // Optimistic Delete
        setEntries(prev => prev.filter(e => e.id !== id));

        const { error } = await supabase
            .from('diary_entries')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Failed to delete", error);
            // Could re-fetch to revert
            fetchEntries(currentUser);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight font-outfit">My Private Secret Diary</h1>
                        <Lock className="w-5 h-5 text-primary/60" />
                    </div>
                    <p className="text-muted-foreground">Just for you, {currentUser}. Shh...</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-primary text-primary-foreground p-3 rounded-full hover:shadow-lg hover:bg-primary/90 transition-all"
                >
                    <Plus className={cn("w-6 h-6 transition-transform", isAdding ? "rotate-45" : "")} />
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 overflow-hidden"
                    >
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <textarea
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                                placeholder="Dear Diary..."
                                className="w-full min-h-[150px] bg-secondary/30 p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 font-handwriting text-lg leading-relaxed"
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEntry}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium shadow-sm hover:shadow hover:bg-primary/90 transition-all"
                                >
                                    Lock it away
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative pl-8 border-l border-border/50 space-y-8">
                {loading ? (
                    <div className="pl-4 py-10 flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading your secrets...
                    </div>
                ) : entries.length === 0 ? (
                    <div className="pl-4 py-10 text-muted-foreground italic">
                        Your secrets are safe here. Start writing...
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-4"
                        >
                            {/* Timeline dot */}
                            <div className="absolute -left-[39px] top-0 flex flex-col items-center">
                                <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
                            </div>

                            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-colors group">
                                <div className="flex items-center justify-between mb-3 text-sm">
                                    <div className="flex items-center gap-2 text-primary font-medium">
                                        <Calendar className="w-4 h-4" />
                                        <span>{entry.date}</span>
                                    </div>
                                    <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="leading-relaxed whitespace-pre-wrap text-foreground/90 font-handwriting text-lg">
                                    {entry.content}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
