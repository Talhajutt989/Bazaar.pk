'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Loader2,
  Store,
  ArrowRight,
  Bot,
  User,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { formatPKR } from '@/lib/utils';
import { ProductMatch } from '@/lib/ai-assistant';
import { VoiceSearchModal } from '@/components/search/VoiceSearchModal';
import { useSupport, ADMIN_SUPPORT_PHONE_FORMATTED } from '@/context/SupportContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  products?: ProductMatch[];
  suggestedQuestions?: string[];
  timestamp: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-msg-1',
  sender: 'ai',
  text: "Hello! 🌟 I am Bazaar.pk's AI Shopping Assistant. How can I help you today?",
  suggestedQuestions: [
    'Customer Support (03315242667)',
    'Konsi products mojood hain?',
    'Desi Ghee & Honey price aur faiday',
    'iPhone 16 Pro Max price & PTA status',
    'Gourmet Dry Fruits & Chilgoza',
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export function AIChatAssistant() {
  const { openSupport } = useSupport();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || 'Here are the details from our marketplace:',
        products: data.products || [],
        suggestedQuestions: data.suggestedQuestions || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Maazrat! Kuch technical issue aya hai. Barahe karam thori dair baad dobara koshish karein.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#090D16]/95 text-amber-300 border border-white/15 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xl backdrop-blur-md animate-bounce pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Bazaar AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle AI Shopping Assistant"
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#090D16] via-slate-900 to-emerald-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-emerald-500/30 group"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-amber-300 transition-transform duration-200" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-7 h-7 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                </span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[620px] h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header Banner */}
          <div className="bg-[#090D16] text-white p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm font-display text-white">Bazaar.pk AI Assistant</h3>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Product Catalog, Pricing & Usage Expert</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Direct Admin Support Helpline Bar */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 px-3.5 py-2 border-b border-white/10 flex items-center justify-between text-[11px] text-emerald-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              <span>Need Direct Human Support?</span>
            </span>
            <button
              type="button"
              onClick={openSupport}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full font-extrabold text-[10px] shadow-sm transition"
            >
              📞 0331-5242667
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Text Bubble */}
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Interactive Product Recommendation Cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 pt-1 w-full">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        🛍️ Matching Catalog Products:
                      </span>
                      <div className="space-y-2">
                        {msg.products.map((p, idx) => (
                          <div
                            key={p.slug || idx}
                            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-2.5 shadow-xs transition hover:shadow-md flex gap-3 items-center group"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative border border-slate-200">
                              {p.images && p.images[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <ShoppingBag className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-emerald-700 transition">
                                {p.title}
                              </h4>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                <span>📍 {p.city || 'Pakistan'}</span>
                                <span>•</span>
                                <span className="text-slate-700 font-semibold truncate">{p.storeName}</span>
                              </div>
                              <div className="text-xs font-extrabold text-emerald-700 mt-0.5">
                                Rs. {p.basePrice.toLocaleString()}
                              </div>
                            </div>

                            {/* Direct View Link */}
                            <Link
                              href={`/products/${p.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-900 hover:text-white rounded-xl transition border border-emerald-200 hover:border-emerald-600 shrink-0"
                              title="View Product Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Question Chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedQuestions.map((chip, chipIdx) => (
                        <button
                          key={chipIdx}
                          onClick={() => handleSendMessage(chip)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-[10px] font-bold px-2.5 py-1 rounded-full transition active:scale-95 text-left"
                        >
                          ⚡ {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-400 block px-1">{msg.timestamp}</span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-500">
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-amber-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-[11px] font-medium text-slate-600">Searching catalog & pricing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. Desi Ghee price, iPhone 16)..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 transition"
            />

            <VoiceSearchModal
              onSearch={(spoken) => {
                if (spoken.trim()) {
                  setInput(spoken);
                  handleSendMessage(spoken);
                }
              }}
              buttonSize="sm"
              className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition shadow-xs text-emerald-900 shrink-0"
              iconClassName="text-emerald-900"
            />

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl transition shadow-sm shrink-0 flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
