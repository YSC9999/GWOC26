"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { instantSpring } from "@/lib/animations";

type Message = {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
};

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth"; // Import useAuth

export default function ChatBot() {
    const pathname = usePathname();
    const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup") || pathname?.includes("/verify-email") || pathname?.includes("/forgot-password");

    const { user } = useAuth(); // Get user
    const [isOpen, setIsOpen] = useState(false);

    // Initial greeting
    const initialMessage: Message = {
        id: "1",
        text: "Hi there! Welcome to Basho. How can I help you discover the perfect piece today?",
        sender: "bot",
        timestamp: new Date(),
    };

    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [inputValue, setInputValue] = useState("");
    const [studioInfo, setStudioInfo] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Reset Chat on Auth Change
    useEffect(() => {
        setMessages([initialMessage]);
        setIsOpen(false);
    }, [user?.email]); // Depend on user email (or just user if object ref changes)

    // Fetch Studio Info on mount
    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await fetch("/api/studio");
                const data = await res.json();
                if (data.studioInfo) {
                    setStudioInfo(data.studioInfo);
                }
            } catch (err) {
                console.error("Failed to fetch studio info for chatbot", err);
            }
        };
        fetchInfo();
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue.trim();
        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newUserMsg]);
        setInputValue("");

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });
            const data = await res.json();

            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: data.reply || "I'm having trouble connecting right now. Please try again later.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botResponse]);

        } catch (err) {
            console.error("Chat Error:", err);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I'm offline at the moment. Please email us instead.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    // Fix: Hooks must run before conditional return
    if (isAuthPage) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={instantSpring}
                        className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-soil/10 overflow-hidden flex flex-col"
                        style={{ maxHeight: "600px", height: "500px" }}
                    >
                        {/* Header */}
                        <div className="bg-soil text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 p-2 rounded-full">
                                    <Sparkles size={18} className="text-sand" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold">Basho Assistant</h3>
                                    <p className="text-xs text-white/70">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-sand/20 space-y-4">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.sender === "user"
                                            ? "bg-clay text-white rounded-br-none"
                                            : "bg-white text-soil border border-soil/5 rounded-bl-none shadow-sm"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t border-soil/10">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-san/10 border border-soil/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-clay focus:ring-1 focus:ring-clay/20 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim()}
                                    className="p-2 bg-soil text-white rounded-full hover:bg-clay transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-clay text-white rounded-full shadow-lg flex items-center justify-center hover:bg-soil transition-colors relative"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageCircle size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Notification Dot */}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </motion.button>
        </div>
    );
}
