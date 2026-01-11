"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Plus, X, Image as ImageIcon, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

import { PARTNER_A } from "@/lib/constants";

type Memory = {
    id: string;
    url: string;
    caption: string;
    author: string;
    date: string;
    created_at: string;
};

export default function GalleryPage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUser, setCurrentUser] = useState(PARTNER_A);
    const [loading, setLoading] = useState(true);

    // Upload State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [uploadingState, setUploadingState] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) setCurrentUser(user);
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('memories')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setMemories(data);
        setLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                setIsUploading(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveMemory = async () => {
        if (!selectedFile) return;
        setUploadingState(true);

        try {
            // 1. Upload to Storage
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(fileName, selectedFile);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('memories')
                .getPublicUrl(fileName);

            // 3. Save to DB
            const { data: dbData, error: dbError } = await supabase
                .from('memories')
                .insert([{
                    url: publicUrl,
                    caption: caption,
                    author: currentUser,
                    date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }),
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (dbError) throw dbError;

            if (dbData) setMemories([dbData, ...memories]);

            // Reset
            setIsUploading(false);
            setPreviewUrl(null);
            setCaption("");
            setSelectedFile(null);

        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload memory. Please try again.");
        } finally {
            setUploadingState(false);
        }
    };

    const deleteMemory = async (id: string, url: string) => {
        if (confirm("Delete this memory?")) {
            setMemories(prev => prev.filter(m => m.id !== id)); // Optimistic

            await supabase.from('memories').delete().eq('id', id);

            // Optional: delete from storage using url parsing, but simpler to leave for now or implement proper cleanup
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-outfit">Our Memories</h1>
                    <p className="text-muted-foreground mt-1">A collection of moments frozen in time.</p>
                </div>
                <label className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Add Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
            </div>

            {/* Upload Modal / Overlay */}
            <AnimatePresence>
                {isUploading && previewUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <div className="relative aspect-square bg-black">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => { setIsUploading(false); setPreviewUrl(null); setSelectedFile(null); }}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Caption</label>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        placeholder="What's happening in this photo?"
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <button
                                    onClick={saveMemory}
                                    disabled={uploadingState}
                                    className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                >
                                    {uploadingState ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Memory"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : memories.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-3xl bg-card/30">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-lg">No memories yet.</p>
                        <p className="text-sm opacity-60">Upload your first photo to start the album.</p>
                    </div>
                ) : (
                    memories.map((memory, index) => (
                        <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative break-inside-avoid"
                        >
                            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                                    <img
                                        src={memory.url}
                                        alt={memory.caption}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <button
                                        onClick={() => deleteMemory(memory.id, memory.url)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <p className="font-medium text-foreground/90 line-clamp-2">{memory.caption}</p>
                                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {memory.author[0]}
                                            </div>
                                            <span>{memory.author}</span>
                                        </div>
                                        <span>{memory.date}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
