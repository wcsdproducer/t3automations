'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';

interface ElevenLabsTestWidgetProps {
  agentId: string;
  voiceId?: string;
  systemPrompt?: string;
  firstMessage?: string;
}

interface ChatMessage {
  id: string;
  source: 'user' | 'agent' | 'ai' | 'system';
  message: string;
}

export function ElevenLabsTestWidget({ agentId, voiceId, systemPrompt, firstMessage }: ElevenLabsTestWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const conversation = useConversation({
    onMessage: (message) => {
      // Safely check what kind of message we received
      if (typeof message === 'object' && message !== null) {
        const payload = message as any;
        const text = payload.message || payload.text || '';
        const source = payload.source || payload.role || 'agent';
        
        if (text) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              source: source as 'user' | 'agent' | 'ai' | 'system',
              message: text,
            },
          ]);
        }
      } else if (typeof message === 'string') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            source: 'agent',
            message: message,
          },
        ]);
      }
    },
    onError: (error: string | Error | any) => {
      console.error('Conversation Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          source: 'system',
          message: typeof error === 'string' ? error : (error as any)?.message || 'An error occurred during the call.',
        },
      ]);
    },
  });

  const handleStartCall = useCallback(async () => {
    try {
      setMessages([{ id: 'init', source: 'system', message: 'Connecting to agent...' }]);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: agentId,
      });
      setMessages((prev) => [
        ...prev,
        { id: 'connected', source: 'system', message: 'Call connected. You can start speaking now.' }
      ]);
    } catch (error: any) {
      console.error('Failed to start call:', error);
      setMessages((prev) => [
        ...prev,
        { id: 'error', source: 'system', message: `Failed to connect: ${error.message || 'Check microphone permissions.'}` }
      ]);
    }
  }, [agentId, conversation]);

  const handleEndCall = useCallback(() => {
    conversation.endSession();
    setMessages((prev) => [
      ...prev,
      { id: 'ended', source: 'system', message: 'Call ended.' }
    ]);
  }, [conversation]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-8 border rounded-lg p-6 bg-slate-50 dark:bg-slate-900 shadow-sm flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground animate-pulse">Loading Voice Agent Tester...</div>
      </div>
    );
  }

  if (!agentId) {
    return (
      <div className="mt-8 border rounded-lg p-6 bg-slate-50 dark:bg-slate-900 shadow-sm relative overflow-hidden text-center">
        <h3 className="text-xl font-semibold mb-2">Test Your Voice Agent</h3>
        <p className="text-muted-foreground mb-6">
          You must save your agent configuration first to test it.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-sm flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 border-b p-4 flex justify-between items-center z-10">
        <div>
          <h3 className="text-lg font-semibold">Live Test: Voice Agent</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            Status: 
            <span className={`inline-block w-2 h-2 rounded-full ${conversation.status === 'connected' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></span>
            <span className="capitalize">{conversation.status}</span>
          </p>
        </div>
        <div>
          {conversation.status === 'connected' ? (
            <button
              onClick={handleEndCall}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="22" y1="2" x2="2" y2="22"/></svg>
              End Call
            </button>
          ) : (
            <button
              onClick={handleStartCall}
              disabled={conversation.status === 'connecting'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              {conversation.status === 'connecting' ? 'Connecting...' : 'Start Test Call'}
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
            <p>Click "Start Test Call" to interact with your agent.</p>
            <p className="text-sm mt-2 max-w-xs text-center opacity-70">
              When the call starts, the transcript of your conversation will appear here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.source === 'user';
            const isSystem = msg.source === 'system';
            
            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isUser 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 border shadow-sm rounded-bl-none text-slate-800 dark:text-slate-200'
                }`}>
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {isUser ? 'You' : 'Agent'}
                  </p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        
        {/* Active listening indicator */}
        {conversation.status === 'connected' && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-slate-800 border shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
               <span className={`w-1.5 h-1.5 rounded-full bg-indigo-500 ${conversation.isSpeaking ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '0ms' }}></span>
               <span className={`w-1.5 h-1.5 rounded-full bg-indigo-500 ${conversation.isSpeaking ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '150ms' }}></span>
               <span className={`w-1.5 h-1.5 rounded-full bg-indigo-500 ${conversation.isSpeaking ? 'animate-bounce' : 'animate-pulse'}`} style={{ animationDelay: '300ms' }}></span>
             </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Footer controls */}
      {conversation.status === 'connected' && (
        <div className="bg-white dark:bg-slate-950 border-t p-3 flex justify-center gap-4">
          <button
            onClick={() => conversation.setMuted(!conversation.isMuted)}
            className={`p-3 rounded-full flex items-center justify-center transition-colors ${
              conversation.isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
            title={conversation.isMuted ? "Unmute Microphone" : "Mute Microphone"}
          >
            {conversation.isMuted ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="22"></line><line x1="8" y1="22" x2="16" y2="22"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
