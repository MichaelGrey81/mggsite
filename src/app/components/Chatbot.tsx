// src/app/components/Chatbot.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface ChatbotProps {
  onClose: () => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
}

export default function Chatbot({ onClose }: ChatbotProps) {
  const [file, setFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hello! I'm StockSense. Please upload your inventory CSV to get started." }
  ]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTo({ top: panelRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setFile(e.target.files[0]);
    setLoading(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    await fetch("http://127.0.0.1:8000/upload_csv/", { method: "POST", body: formData, credentials: "same-origin"});
    setMessages(prev => [...prev, { sender: "bot", text: "Loaded with encoding! What would you like to know?" }]);
    setLoading(false);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;
    setMessages(prev => [...prev, { sender: "user", text: question }]);
    setInput("");
    setLoading(true);
    const res = await fetch("http://127.0.0.1:8000/ask/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      credentials: "same-origin"
    });
    const data = await res.json();
    setMessages(prev => [...prev, { sender: "bot", text: data.answer }]);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-y-0 right-0 w-3/5 max-w-2xl bg-gray-00 text-white shadow-lg flex flex-col rounded-l-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">StockSense</h2>
          <button onClick={onClose} aria-label="Close chat">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat panel */}
        <div ref={panelRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                'flex',
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  'px-5 py-3 rounded-2xl max-w-[80%] whitespace-pre-wrap text-base',
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-white rounded-bl-none'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white px-5 py-3 rounded-2xl rounded-bl-none animate-pulse text-base">
                ...
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-gray-700 space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="w-full text-sm text-gray-300"
          />
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 p-3 bg-gray-800 rounded-xl text-white text-base"
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-6 bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-base"
            >
              Send
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
