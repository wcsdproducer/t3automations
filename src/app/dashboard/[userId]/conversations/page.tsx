'use client';

import React, { useState } from 'react';
import {
  Clock,
  Copy,
  Download,
  Filter,
  Search,
  Trash2,
  Loader2,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { CallLog } from '@/types/crm';
import { Badge } from '@/components/ui/badge';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ConversationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const userIdSlug = params.userId as string;

  const [period, setPeriod] = useState('last-30-days');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const agentsRef = useMemoFirebase(() => {
    if (!user || !firestore || user.uid.slice(-12) !== userIdSlug) return null;
    return query(collection(firestore, `businessProfiles/${user.uid}/agents`));
  }, [user, firestore, userIdSlug]);

  const { data: agentsData, isLoading: isAgentsLoading } = useCollection(agentsRef);
  const agentId = agentsData?.[0]?.id;

  const callsRef = useMemoFirebase(() => {
    if (!user || !firestore || !agentId || user.uid.slice(-12) !== userIdSlug) return null;
    return query(
      collection(firestore, `businessProfiles/${user.uid}/agents/${agentId}/conversations`),
      orderBy('startedAt', 'desc')
    );
  }, [user, firestore, userIdSlug, agentId]);

  const { data: callsData, isLoading: isCallsLoading } = useCollection(callsRef);

  if (isAgentsLoading || isCallsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const calls = (callsData || []) as CallLog[];
  
  // Filter calls by period
  const now = new Date();
  const days = period === 'last-7-days' ? 7 : period === 'last-30-days' ? 30 : 90;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const filteredCalls = calls.filter(call => new Date(call.startedAt) >= cutoff);
  const selectedCall = filteredCalls.find(c => c.callSid === selectedCallId) || filteredCalls[0];

  return (
    <main className="flex flex-1 flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between gap-4 p-4 lg:p-6 border-b shrink-0">
        <h1 className="text-lg font-semibold md:text-2xl">Conversations ({filteredCalls.length})</h1>
        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr] lg:grid-cols-[350px_1fr_350px] overflow-hidden">
        {/* Left Column: Conversation List */}
        <div className="flex flex-col border-r overflow-hidden">
          <div className="p-4 border-b shrink-0 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search callers..." className="pl-8 w-full" />
            </div>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCalls.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center h-full">
                <p className="text-muted-foreground text-sm">No Conversations Available</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredCalls.map(call => (
                  <button
                    key={call.callSid}
                    onClick={() => setSelectedCallId(call.callSid)}
                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedCall?.callSid === call.callSid ? 'bg-muted' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{call.callerNumber || 'Unknown Caller'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(call.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {call.outcome === 'answered' ? <PhoneCall className="h-3 w-3 text-green-500" /> : call.outcome === 'missed' ? <PhoneMissed className="h-3 w-3 text-red-500" /> : <PhoneIncoming className="h-3 w-3 text-yellow-500" />}
                      <span>{formatDuration(call.duration)}</span>
                      {call.leadCaptured && <Badge variant="secondary" className="text-[10px] px-1 h-4">Lead</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {call.summary || 'No summary available.'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Column: Chat Transcript */}
        <div className="flex flex-col overflow-hidden bg-muted/5">
          <div className="p-4 border-b shrink-0 flex items-center justify-between bg-background">
            <div>
              <h2 className="font-semibold">{selectedCall?.callerNumber || 'Transcript'}</h2>
              <p className="text-xs text-muted-foreground">
                {selectedCall ? new Date(selectedCall.startedAt).toLocaleString() : 'Select a call'}
              </p>
            </div>
            {selectedCall?.outcome && (
              <Badge variant={selectedCall.outcome === 'answered' ? 'default' : 'secondary'} className="capitalize">
                {selectedCall.outcome}
              </Badge>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedCall ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <p>No Messages Available</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                <div className="bg-white border rounded-lg p-6 shadow-sm whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedCall.transcript || <span className="italic text-muted-foreground">No transcript recorded for this call.</span>}
                </div>
              </div>
            )}
          </div>
           
          {selectedCall && (
            <div className="p-4 border-t bg-background shrink-0">
              <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                      <span>Duration: {formatDuration(selectedCall.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" disabled>
                          <Download className="h-4 w-4" />
                      </Button>
                  </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Details and Actions */}
        <div className="hidden lg:flex flex-col border-l bg-muted/20 overflow-y-auto">
          {selectedCall ? (
            <div className="p-4 space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="text-base">Call Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                      <p className="text-muted-foreground">{selectedCall.summary || 'No summary available.'}</p>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                      <CardTitle className="text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-around">
                       <Button variant="outline" size="icon" title="View Logs"><Clock className="h-4 w-4" /></Button>
                       <Button variant="outline" size="icon" title="Copy ID" onClick={() => navigator.clipboard.writeText(selectedCall.callSid)}><Copy className="h-4 w-4" /></Button>
                       <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </CardContent>
              </Card>
              {selectedCall.leadId && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Linked Lead</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground">Lead ID: {selectedCall.leadId.slice(0, 8)}...</p>
                         <Button variant="link" className="p-0 h-auto mt-2 text-primary">View Lead Record &rarr;</Button>
                    </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="p-4 flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
