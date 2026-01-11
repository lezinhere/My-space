"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, BookHeart, Smile, Image as ImageIcon, StickyNote, LogOut, MessageCircleHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PARTNER_A, PARTNER_B, APP_NAME } from "@/lib/constants";

const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "My Diary", href: "/dashboard/diary", icon: BookHeart },
    { name: "Whisper", href: "/dashboard/messages", icon: MessageCircleHeart },
    { name: "Moods", href: "/dashboard/mood", icon: Smile },
    { name: "Gallery", href: "/dashboard/gallery", icon: ImageIcon },
    { name: "Notes", href: "/dashboard/notes", icon: StickyNote },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState(`${PARTNER_A} & ${PARTNER_B}`); // Default

    useEffect(() => {
        setMounted(true);
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) setUser(storedUser);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex h-screen bg-background/50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-card/50 backdrop-blur-sm border-r border-border p-4">
                {/* ... Sidebar Content ... */}
                <div className="flex items-center gap-3 px-4 py-8 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 text-primary-foreground">
                        <span className="font-bold text-lg font-outfit">{user[0]}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-muted-foreground uppercase tracking-widest font-medium">Space for</span>
                        <span className="font-bold text-xl tracking-tight text-primary">{user}</span>
                    </div>
                </div>

                <nav className="space-y-2 flex-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 relative z-10", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors")} />
                                <span className="font-medium relative z-10">{item.name}</span>
                                {isActive && <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-primary z-0" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4 border-t border-border">
                    <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header (Top Bar) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 flex items-center justify-between px-4 shadow-sm">
                <h1 className="font-outfit font-bold text-lg text-foreground">{APP_NAME}</h1>
                <Link href="/login" className="p-2 text-foreground hover:text-destructive transition-colors flex items-center gap-2">
                    <span className="text-xs font-semibold">LOGOUT</span>
                    <LogOut className="w-5 h-5" />
                </Link>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-border z-50 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
                <div className="flex justify-around items-center p-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center p-2 rounded-lg"
                            >
                                <motion.div
                                    animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -5 : 0 }}
                                    className={cn(
                                        "p-2 rounded-full mb-1 transition-colors",
                                        isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "bg-transparent"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                </motion.div>
                                {isActive && (
                                    <span className="text-[10px] font-bold text-primary animate-fade-in">
                                        {item.name}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24 pt-20 md:pt-8 md:pb-8">
                <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
