"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Note = {
    id: string;
    content: string;
    color: string;
    rotation: number;
    author: string;
    created_at: string;
};

const COLORS = [
    "bg-yellow-100 dark:bg-yellow-900/30",
    "bg-blue-100 dark:bg-blue-900/30",
    "bg-green-100 dark:bg-green-900/30",
    "bg-pink-100 dark:bg-pink-900/30",
    "bg-purple-100 dark:bg-purple-900/30"
];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newNote, setNewNote] = useState("");
    const [currentUser, setCurrentUser] = useState("Aami");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) setCurrentUser(user);
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('shared_notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setNotes(data);
        setLoading(false);
    };

    const addNote = async () => {
        if (!newNote.trim()) return;

        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const rotation = Math.floor(Math.random() * 6) - 3; // -3 to +3 deg

        const optimisticNote: Note = {
            id: "temp-" + Date.now(),
            content: newNote,
            color,
            rotation,
            author: currentUser,
            created_at: new Date().toISOString()
        };

        setNotes([optimisticNote, ...notes]);
        setIsAdding(false);
        setNewNote("");

        const { data, error } = await supabase
            .from('shared_notes')
            .insert([{
                content: newNote,
                color,
                rotation,
                author: currentUser
            }])
            .select()
            .single();

        if (data) {
            setNotes(prev => prev.map(n => n.id === optimisticNote.id ? data : n));
        } else {
            console.error("Error adding note", error);
            setNotes(prev => prev.filter(n => n.id !== optimisticNote.id));
        }
    };

    const deleteNote = async (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        await supabase.from('shared_notes').delete().eq('id', id);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Shared Notes</h1>
                    <p className="text-muted-foreground mt-1">Leave a sticky for your partner.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium shadow-lg shadow-primary/20 flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    New Note
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <div
                            className="bg-card w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4"
                        >
                            <h2 className="text-lg font-semibold">New Note</h2>
                            <textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Write something..."
                                className="w-full h-32 bg-secondary/30 p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-black/5 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addNote}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium"
                                >
                                    Post Note
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl">
                        <p>No notes yet.</p>
                    </div>
                ) : (
                    notes.map((note, index) => (
                        <motion.div
                            key={note.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1, rotate: note.rotation }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                                "aspect-square p-6 rounded-sm shadow-md flex flex-col justify-between group transition-transform hover:scale-105 hover:rotate-0 hover:z-10 relative",
                                note.color
                            )}
                        >
                            {/* Pin effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-black/20 shadow-sm" />

                            <p className="font-handwriting text-xl leading-relaxed text-foreground/80 overflow-y-auto max-h-[140px] scrollbar-none">
                                {note.content}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-black/5 mt-auto">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-50">{note.author}</span>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded-full transition-all"
                                >
                                    <X className="w-4 h-4 opacity-50" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
