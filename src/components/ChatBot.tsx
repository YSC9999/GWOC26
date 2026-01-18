"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, MessageSquare } from "lucide-react";
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
  const isAuthPage =
    pathname?.includes("/login") ||
    pathname?.includes("/signup") ||
    pathname?.includes("/verify-email") ||
    pathname?.includes("/forgot-password");

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
      // Send conversation history (excluding the initial greeting)
      const conversationHistory = messages
        .filter((msg) => msg.id !== "1") // Exclude initial greeting
        .map((msg) => ({
          sender: msg.sender,
          text: msg.text,
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: conversationHistory,
        }),
      });
      const data = await res.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text:
          data.reply ||
          "I'm having trouble connecting right now. Please try again later.",
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

  const isAdminPage = pathname?.startsWith("/admin");

  // Fix: Hooks must run before conditional return
  if (isAuthPage || isAdminPage) return null;

  return (
    <div
      className="fixed bottom-6 sm:bottom-6 right-6 z-30 sm:z-50 flex flex-col items-end pointer-events-none"
      style={{ bottom: "calc(60px + 1.5rem)" }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={instantSpring}
            className="pointer-events-auto fixed sm:static bottom-24 right-6 mb-4 w-[calc(100vw-3rem)] sm:w-96 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col z-[60]"
            style={{ maxHeight: "calc(100vh - 140px)", height: "600px" }}
          >
            {/* Header */}
            <div className="bg-clay text-white p-5 flex items-center shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10 shadow-inner">
                  <Sparkles size={18} className="text-sand animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg tracking-wide">
                    Basho Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[10px] font-medium uppercase tracking-wider">
                      Online
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 bg-sand/10 space-y-4 scrollbar-thin scrollbar-thumb-clay/20 scrollbar-track-transparent">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-clay text-white rounded-br-none"
                        : "bg-white text-soil border border-white/50 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[10px] mt-1 opacity-50 text-right ${msg.sender === "user" ? "text-white" : "text-soil"}`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-sand/30">
              <div className="flex gap-2 items-center bg-sand/10 rounded-[2rem] p-1.5 border border-sand/20 focus-within:ring-2 focus-within:ring-clay/20 focus-within:border-clay/50 transition-all shadow-inner">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-soil/40 text-soil"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-clay text-white rounded-full hover:bg-soil transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-soil/30 font-medium tracking-wide uppercase">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto w-16 h-16 bg-gradient-to-br from-clay to-soil text-white rounded-2xl shadow-xl shadow-clay/30 flex items-center justify-center hover:shadow-2xl hover:shadow-clay/40 transition-all relative border border-white/20"
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
              <X size={28} strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <MessageSquare
                size={28}
                strokeWidth={2.5}
                className="text-white drop-shadow-md fill-white/20"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Dot */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-[3px] border-sand flex items-center justify-center shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
