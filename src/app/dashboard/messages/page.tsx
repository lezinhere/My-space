"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MailOpen, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
    id: string;
    date: string;
    content: string;
    author: string;
    target: string;
    created_at: string;
};

export default function MessagesPage() {
    const [currentUser, setCurrentUser] = useState("Aami");
    const [targetUser, setTargetUser] = useState("Lechu");
    const [myMessageToday, setMyMessageToday] = useState<string>("");
    const [partnerMessageToday, setPartnerMessageToday] = useState<Message | null>(null);
    const [hasSentToday, setHasSentToday] = useState(false);
    const [loading, setLoading] = useState(true);

    const todayDate = new Date().toLocaleDateString();

    useEffect(() => {
        const user = localStorage.getItem("currentUser");
        if (user) {
            setCurrentUser(user);
            setTargetUser(user === "Aami" ? "Lechu" : "Aami");
            fetchMessages(user, user === "Aami" ? "Lechu" : "Aami");
        }
    }, [todayDate]);

    const fetchMessages = async (me: string, partner: string) => {
        setLoading(true);

        // 1. Check if I sent one
        const { data: myData } = await supabase
            .from('messages')
            .select('*')
            .eq('author', me)
            .eq('date', todayDate)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (myData) {
            setMyMessageToday(myData.content);
            setHasSentToday(true);
        }

        // 2. Check if I received one
        const { data: partnerData } = await supabase
            .from('messages')
            .select('*')
            .eq('author', partner) // Written BY partner
            .eq('date', todayDate) // For today
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (partnerData) {
            setPartnerMessageToday(partnerData);
        }

        setLoading(false);
    };

    const sendMessage = async () => {
        if (!myMessageToday.trim()) return;

        // Optimistic
        setHasSentToday(true);

        const { error } = await supabase.from('messages').insert([{
            date: todayDate,
            content: myMessageToday,
            author: currentUser,
            target: targetUser
        }]);

        if (error) {
            console.error("Error sending", error);
            setHasSentToday(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2 font-outfit">Daily Whisper</h1>
                <p className="text-muted-foreground">Share a thought just for today.</p>
            </div>

            {/* Write Message Section */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary rounded-3xl p-8 border border-primary/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Send className="w-24 h-24" />
                </div>

                <h2 className="text-xl font-semibold mb-4 relative z-10">Tell {targetUser} about today...</h2>

                <div className="relative z-10">
                    <textarea
                        value={myMessageToday}
                        onChange={(e) => setMyMessageToday(e.target.value)}
                        placeholder={`"Today I felt..." or "I missed you when..."`}
                        className="w-full min-h-[120px] bg-background/80 backdrop-blur-sm p-4 rounded-xl resize-none outline-none focus:ring-2 focus:ring-primary/20 shadow-inner"
                    />
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className="bg-primary text-primary-foreground px-6 py-2 rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Send className="w-4 h-4" />
                            {hasSentToday ? "Update Message" : "Send Whisper"}
                        </button>
                    </div>
                    {hasSentToday && (
                        <p className="text-xs text-primary mt-2 text-right font-medium">✓ Sent for today</p>
                    )}
                </div>
            </div>

            {/* Read Message Section */}
            <div className="relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-border -z-10" />
                <div className="text-center bg-background px-4 w-fit mx-auto text-muted-foreground text-sm font-medium">
                    FROM {targetUser.toUpperCase()}
                </div>
            </div>

            <div className="flex justify-center">
                {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                ) : partnerMessageToday ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-card border border-border p-8 rounded-3xl shadow-lg max-w-sm w-full text-center relative"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <MailOpen className="w-6 h-6" />
                        </div>
                        <h3 className="font-handwriting text-2xl leading-relaxed text-foreground/90">
                            "{partnerMessageToday.content}"
                        </h3>
                        <p className="text-xs text-muted-foreground mt-6 uppercase tracking-widest">
                            Received Today
                        </p>
                    </motion.div>
                ) : (
                    <div className="text-center opacity-60 max-w-sm py-8">
                        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No whisper yet</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Wait for {targetUser} to write specific words for today.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
