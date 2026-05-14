'use client';

import React, { useState } from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneCall, PhoneOff } from 'lucide-react';

interface ElevenLabsTestWidgetProps {
  agentId: string;
  voiceId?: string;
  systemPrompt?: string;
  firstMessage?: string;
}

function TestWidgetUI({ agentId, voiceId, systemPrompt, firstMessage }: ElevenLabsTestWidgetProps) {
  const { status, startSession, endSession, isSpeaking } = useConversation({
    onError: (err: any) => {
      console.error('ElevenLabs onError:', err);
      setError(typeof err === 'string' ? err : (err as any)?.message || 'Unknown error occurred');
    },
    onDisconnect: () => {
      console.log('ElevenLabs onDisconnect');
    },
    onConnect: () => {
      console.log('ElevenLabs onConnect');
    }
  });
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Fetch WebSocket signed URL from our secure backend endpoint
      const response = await fetch(`/api/elevenlabs/get-signed-url?agentId=${agentId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to get authorization for the agent');
      }
      const data = await response.json();

      if (!data.signed_url) {
        throw new Error('Invalid response from authorization endpoint');
      }

      await startSession({ signedUrl: data.signed_url });
    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      setError(err.message || 'Failed to start the call. Check microphone permissions and agent status.');
    }
  };

  return (
    <div className="mt-8 border rounded-lg p-6 bg-slate-50 dark:bg-slate-900 shadow-sm relative overflow-hidden">
      {/* Decorative gradient background similar to premium UI components */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-2">Test Your Voice Agent</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Make a live test call directly from your browser to verify your agent's knowledge, voice, and webhook functionality.
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md mb-4 text-sm w-full max-w-md text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          <div 
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              status === 'connected' 
                ? isSpeaking 
                  ? 'bg-primary/20 ring-4 ring-primary animate-pulse' 
                  : 'bg-primary/10 ring-2 ring-primary/50'
                : 'bg-muted'
            }`}
          >
            {status === 'connected' ? (
              <Mic className={`w-10 h-10 ${isSpeaking ? 'text-primary' : 'text-primary/70'}`} />
            ) : (
              <MicOff className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <div className="text-sm font-medium uppercase tracking-wider">
            {status === 'connected' ? (
              <span className="text-primary flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
                {isSpeaking ? 'Agent Speaking...' : 'Listening...'}
              </span>
            ) : status === 'connecting' ? (
              <span className="text-muted-foreground">Connecting...</span>
            ) : (
              <span className="text-muted-foreground">Ready to Test</span>
            )}
          </div>

          <div className="mt-4">
            {status === 'connected' ? (
              <Button 
                onClick={endSession} 
                variant="destructive" 
                size="lg"
                className="rounded-full px-8 shadow-lg shadow-destructive/20 hover:shadow-destructive/40 transition-shadow"
              >
                <PhoneOff className="w-5 h-5 mr-2" />
                End Test Call
              </Button>
            ) : (
              <Button 
                onClick={handleStart} 
                size="lg"
                disabled={status === 'connecting' || !agentId}
                className="rounded-full px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-white border-0"
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                {status === 'connecting' ? 'Connecting...' : 'Start Test Call'}
              </Button>
            )}
          </div>
          
          {!agentId && (
            <p className="text-xs text-muted-foreground mt-2">
              You must save your agent configuration first to test it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ElevenLabsTestWidget(props: ElevenLabsTestWidgetProps) {
  return (
    <ConversationProvider>
      <TestWidgetUI {...props} />
    </ConversationProvider>
  );
}
