"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Sun, BatteryLow, HelpCircle, Sparkles, Frown, ArrowRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS = [
    { id: "sad", keywords: ["sad", "cry", "down", "unhappy", "blue", "depressed"], label: "Sad", icon: CloudRain, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { id: "happy", keywords: ["happy", "good", "great", "joy", "awesome", "love"], label: "Happy", icon: Sun, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
    { id: "exhausted", keywords: ["tired", "exhausted", "sleepy", "drained", "fatigue"], label: "Exhausted", icon: BatteryLow, color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
    { id: "confused", keywords: ["confused", "lost", "unsure", "weird"], label: "Confused", icon: HelpCircle, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    { id: "excited", keywords: ["excited", "pumped", "looking forward", "hyped"], label: "Excited", icon: Sparkles, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
    { id: "demotivated", keywords: ["demotivated", "lazy", "boring", "bored", "stuck"], label: "Demotivated", icon: Frown, color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
];

export default function MoodPage() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [step, setStep] = useState<"question" | "result">("question");
    const [detectedMood, setDetectedMood] = useState<typeof MOODS[0] | null>(null);

    const analyzeMood = () => {
        if (!input.trim()) return;

        const text = input.toLowerCase();

        // Simple keyword matching
        const match = MOODS.find(m => m.keywords.some(k => text.includes(k)));

        if (match) {
            setDetectedMood(match);
        } else {
            setDetectedMood(null);
        }
        setStep("result");
    };

    const goToMood = (moodId: string) => {
        router.push(`/dashboard/mood/${moodId}`);
    };

    return (
        <div className="max-w-xl mx-auto min-h-[60vh] flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {step === "question" ? (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h1 className="text-4xl font-bold font-outfit tracking-tight">How are you feeling?</h1>
                            <p className="text-muted-foreground text-lg">Tell me about your day...</p>
                        </div>

                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && analyzeMood()}
                                className="w-full min-h-[150px] bg-card border border-border p-6 rounded-3xl text-lg shadow-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none"
                                placeholder="I'm feeling a bit..."
                                autoFocus
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={analyzeMood}
                                disabled={!input.trim()}
                                className="absolute bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight className="w-6 h-6" />
                            </motion.button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setStep("result")} // Skip logic
                                className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline"
                            >
                                Skip to mood selection
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {detectedMood ? (
                            <div className="text-center space-y-6">
                                <h2 className="text-2xl font-semibold">It sounds like you might be feeling <span className="text-primary">{detectedMood.label}</span>.</h2>
                                <p className="text-muted-foreground">Is that right?</p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => goToMood(detectedMood.id)}
                                        className={cn(
                                            "px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-3 shadow-md",
                                            detectedMood.color
                                        )}
                                    >
                                        <detectedMood.icon className="w-6 h-6" />
                                        Yes, go to {detectedMood.label} Space
                                    </button>
                                </div>

                                <button
                                    onClick={() => setDetectedMood(null)}
                                    className="text-sm text-muted-foreground hover:text-foreground underline"
                                >
                                    No, it's something else
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-semibold">I understand.</h2>
                                    <p className="text-muted-foreground">Select the space that fits you best right now.</p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {MOODS.map((mood, index) => (
                                        <motion.button
                                            key={mood.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => goToMood(mood.id)}
                                            className={cn(
                                                "h-32 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:scale-105 transition-transform shadow-sm hover:shadow-md border border-transparent hover:border-black/5",
                                                mood.color
                                            )}
                                        >
                                            <mood.icon className="w-8 h-8" />
                                            <span className="font-medium">{mood.label}</span>
                                        </motion.button>
                                    ))}
                                </div>

                                <div className="text-center mt-8">
                                    <button
                                        onClick={() => {
                                            setStep("question");
                                            setInput("");
                                            setDetectedMood(null);
                                        }}
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        ← Back to question
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
