'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotWidgetProps {
  businessProfileId: string;
  companyName?: string;
  niche?: string;
}

export function ChatbotWidget({ businessProfileId, companyName = 'Appliance Repair Experts', niche = 'Appliance Repair' }: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hi! I'm the AI assistant for ${companyName}. How can I help you with your ${niche.toLowerCase()} needs today?`
      }
    ]);
  }, [companyName, niche]);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to state
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessProfileId,
          messages: newMessages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      
      if (data.leadCaptured) {
        setLeadCaptured(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to my server. Please try again or call our dispatch line directly.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl hover:bg-blue-500 hover:scale-105 transition-all duration-300 relative group animate-bounce"
          aria-label="Chat with AI assistant"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          
          {/* Tooltip hint on hover */}
          <div className="absolute right-16 top-2.5 scale-0 group-hover:scale-100 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-md whitespace-nowrap origin-right transition-all duration-200">
            Chat with AI assistant ⚡
          </div>
        </button>
      )}

      {/* Expandable Chat Window */}
      {isOpen && (
        <div className="flex h-[500px] w-[360px] sm:w-[380px] flex-col rounded-2xl border border-slate-100 bg-white shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4.5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-none">{companyName}</h4>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-blue-100 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>AI Tech Assistant • Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              aria-label="Close chat assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* CRM Lead Captured Alert Banner */}
          {leadCaptured && (
            <div className="flex items-center gap-2 bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Inquiry submitted! A representative will call or text you shortly.</span>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-white border border-slate-100 px-4 py-3 text-slate-400 shadow-sm flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">Assistant is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form Footer */}
          <form onSubmit={handleSend} className="border-t border-slate-100 bg-white p-3.5 flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything or request a service..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 placeholder:text-slate-400 text-sm h-10"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 p-0 rounded-xl shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="bg-slate-50 px-4 py-1.5 text-center text-[9px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-blue-500" /> Powered by T3 Auto-Agent
          </div>
        </div>
      )}
    </div>
  );
}
