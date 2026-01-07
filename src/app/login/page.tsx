"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, KeyRound, UserCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { PARTNER_A, PARTNER_B, APP_NAME } from "@/lib/constants";

export default function LoginPage() {
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (userType: string) => {
        setLoading(true);
        setError("");

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('pin')
                .eq('name', userType)
                .single();

            if (error || !data) {
                console.error("Login error", error);
                setError("User not found or connection error");
                setLoading(false);
                return;
            }

            if (data.pin === pin) {
                localStorage.setItem("currentUser", userType);
                router.push("/dashboard");
            } else {
                setError("Wrong PIN");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!selectedUser) return;
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (newPassword.length < 4) {
            setError("Password too short");
            return;
        }

        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ pin: newPassword })
            .eq('name', selectedUser);

        if (error) {
            setError("Failed to update password");
        } else {
            setSuccessMsg("Password changed successfully!");
            setTimeout(() => {
                setShowChangePassword(false);
                setSuccessMsg("");
                setNewPassword("");
                setConfirmPassword("");
            }, 1500);
        }
        setLoading(false);
    };

    // Reset state when switching users
    useEffect(() => {
        setPin("");
        setError("");
        setSuccessMsg("");
        setShowChangePassword(false);
    }, [selectedUser]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-lg z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-card/50 backdrop-blur-sm shadow-sm mb-6 border border-border/50">
                        <Heart className="w-10 h-10 text-primary fill-primary/10" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground/90 font-outfit">{APP_NAME}</h1>
                    <p className="text-muted-foreground mt-2 font-light tracking-wide">Enter your secret space</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!selectedUser ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 gap-6"
                        >
                            {[PARTNER_A, PARTNER_B].map((user, i) => (
                                <motion.button
                                    key={user}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSelectedUser(user)}
                                    className="group relative h-56 rounded-3xl border border-border/40 bg-card/60 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-primary/30 transition-all flex flex-col items-center justify-center p-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center mb-6 transition-colors shadow-inner">
                                        <UserCircle2 className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <span className="font-semibold text-xl tracking-wide text-foreground/80 group-hover:text-primary transition-colors">{user}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-xl max-w-sm mx-auto relative"
                        >
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="absolute left-4 top-4 text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-8 mt-2">
                                <h2 className="text-2xl font-semibold text-foreground/90">Hello, {selectedUser}</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {showChangePassword ? "Set your new password" : "Enter your password to continue"}
                                </p>
                            </div>

                            {!showChangePassword ? (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            autoFocus
                                            value={pin}
                                            onChange={(e) => {
                                                setPin(e.target.value);
                                                setError("");
                                            }}
                                            onKeyDown={(e) => e.key === 'Enter' && handleLogin(selectedUser)}
                                            className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-xl border border-transparent bg-background/50 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-inner placeholder:tracking-normal placeholder:text-base placeholder:text-muted-foreground/50 text-foreground"
                                            placeholder="••••"
                                            disabled={loading}
                                        />
                                        {error && <p className="text-destructive text-sm text-center font-medium animate-pulse">{error}</p>}
                                    </div>

                                    <button
                                        onClick={() => handleLogin(selectedUser)}
                                        disabled={loading}
                                        className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                                    >
                                        Unlock Space
                                    </button>

                                    <button
                                        onClick={() => setShowChangePassword(true)}
                                        className="w-full text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 py-2"
                                    >
                                        <KeyRound className="w-3 h-3" />
                                        Change Password
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none text-center"
                                            placeholder="New Password"
                                        />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none text-center"
                                            placeholder="Confirm Password"
                                        />
                                    </div>

                                    {error && <p className="text-destructive text-sm text-center">{error}</p>}
                                    {successMsg && <p className="text-green-600 text-sm text-center font-medium">{successMsg}</p>}

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowChangePassword(false)}
                                            className="flex-1 py-3 text-sm font-medium text-muted-foreground hover:bg-black/5 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={loading}
                                            className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-md hover:opacity-90 transition-opacity flex items-center justify-center"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
