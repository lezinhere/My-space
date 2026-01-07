"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const MOODS: Record<string, { label: string; color: string; message: string }> = {
    sad: { label: "Sad", color: "bg-blue-100 dark:bg-blue-900/30", message: "It's okay not to be okay. I'm here." },
    exhausted: { label: "Exhausted", color: "bg-orange-100 dark:bg-orange-900/30", message: "Rest your head. You've done enough today." },
    happy: { label: "Happy", color: "bg-yellow-100 dark:bg-yellow-900/30", message: "Your smile makes my world brighter!" },
    anxious: { label: "Anxious", color: "bg-purple-100 dark:bg-purple-900/30", message: "Breathe. I've got you. We've got this." },
    excited: { label: "Excited", color: "bg-pink-100 dark:bg-pink-900/30", message: "Yay! I love seeing you like this!" },
    angry: { label: "Angry", color: "bg-red-100 dark:bg-red-900/30", message: "Let it out. I'm listening." },
};

type MoodNote = {
    id: string;
    content: string;
    author: string;
    created_at: string;
};

export default function MoodDetailPage() {
    const params = useParams();
    const moodKey = params?.mood as string;
    const mood = MOODS[moodKey] || MOODS.sad;

    const [currentUser, setCurrentUser] = useState("Aami");
    const [partnerName, setPartnerName] = useState("Lechu");
    const [note, setNote] = useState("");
    const [partnerNotes, setPartnerNotes] = useState<MoodNote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) {
            setCurrentUser(user);
            setPartnerName(user === "Aami" ? "Lechu" : "Aami");
            fetchPartnerNotes(user === "Aami" ? "Lechu" : "Aami");
        }
    }, [moodKey]);

    const fetchPartnerNotes = async (partner: string) => {
        setLoading(true);
        // Fetch notes written BY partner FOR this mood
        // We really want to see what partner wrote for ME when I am this mood, OR just general notes they wrote for this mood.
        // Let's assume we want to read "Letters from Partner when I am Sad".
        // Use 'target' field if we want to be specific, or just 'author'.
        // For now, let's just show notes the partner wrote tagged with this mood.

        const { data } = await supabase
            .from('mood_notes')
            .select('*')
            .eq('mood', moodKey)
            .eq('author', partner)
            .order('created_at', { ascending: false });

        if (data) setPartnerNotes(data);
        setLoading(false);
    };

    const saveNote = async () => {
        if (!note.trim()) return;

        // Writing a note FOR the partner when THEY are in this mood
        const { error } = await supabase.from('mood_notes').insert([{
            mood: moodKey,
            content: note,
            author: currentUser,
            target: partnerName
        }]);

        if (!error) {
            setNote("");
            alert("Note sent to their space!");
        } else {
            console.error(error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Link href="/dashboard/mood" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Moods
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("p-8 rounded-3xl mb-8 text-center shadow-sm border border-black/5", mood.color)}
            >
                <h1 className="text-4xl font-bold mb-4 font-outfit text-foreground/80">{mood.label}</h1>
                <p className="text-xl font-medium text-foreground/60">"{mood.message}"</p>
            </motion.div>

            <div className="space-y-8">
                {/* Read Notes from Partner */}
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        From {partnerName}
                    </h2>

                    {loading ? (
                        <div className="py-10 flex justify-center text-muted-foreground">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : partnerNotes.length === 0 ? (
                        <div className="bg-card/50 border border-border/50 rounded-2xl p-8 text-center text-muted-foreground">
                            <p>No notes from {partnerName} yet for when you feel {mood.label.toLowerCase()}.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {partnerNotes.map((n) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-card border border-border p-6 rounded-2xl shadow-sm relative"
                                >
                                    <p className="font-handwriting text-lg leading-relaxed text-foreground/90">{n.content}</p>
                                    <span className="text-xs text-muted-foreground mt-2 block opacity-50">{new Date(n.created_at).toLocaleDateString()}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Write Note for Partner */}
                <div className="border-t border-border pt-8">
                    <h3 className="font-semibold mb-3">Write for {partnerName} when they feel {mood.label.toLowerCase()}</h3>
                    <div className="relative">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Write something comforting..."
                            className="w-full bg-secondary/30 p-4 pr-12 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                        />
                        <button
                            onClick={saveNote}
                            className="absolute bottom-3 right-3 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            disabled={!note.trim()}
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        They will see this when they come here feeling {mood.label.toLowerCase()}.
                    </p>
                </div>
            </div>
        </div>
    );
}
