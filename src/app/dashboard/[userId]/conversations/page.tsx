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
  PhoneIncoming,
  FileText
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
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, where } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { CallLog, Lead, BusinessProfile } from '@/types/crm';
import { Appointment } from '@/types/calendar';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/lib/utils';

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getCallResult(call: CallLog, apt: Appointment | null) {
  if (apt) {
    return {
      title: 'Appointment Booked',
      description: `Scheduled for ${new Date(apt.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} at ${apt.time} (${apt.service})`,
      color: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-900/50'
    };
  }
  if (call.outcome === 'missed') {
    return {
      title: 'Missed Call',
      description: 'The caller did not reach the agent.',
      color: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-900/50'
    };
  }
  if (call.duration < 15) {
    return {
      title: 'Hung Up Quickly',
      description: 'The caller disconnected shortly after connecting.',
      color: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950/30 dark:border-yellow-900/50'
    };
  }
  if (call.leadCaptured) {
    return {
      title: 'Lead Captured',
      description: 'The caller provided information and was saved as a lead.',
      color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-900/50'
    };
  }
  return {
    title: 'General Inquiry',
    description: 'The caller interacted with the agent but no specific action was taken.',
    color: 'text-muted-foreground bg-muted/50 border-border'
  };
}

export default function ConversationsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const userIdSlug = params.userId as string;

  const [period, setPeriod] = useState('last-30-days');
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const profileDocRef = useMemoFirebase(() => {
    if (!userIdSlug || !firestore) return null;
    return doc(firestore, 'businessProfiles', userIdSlug);
  }, [userIdSlug, firestore]);

  const { data: businessProfile, isLoading: isProfileLoading } = useDoc<BusinessProfile>(profileDocRef);

  const agentsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `businessProfiles/${userIdSlug}/agents`));
  }, [user, firestore, userIdSlug]);

  const { data: agentsData, isLoading: isAgentsLoading } = useCollection(agentsRef);
  const agentId = agentsData?.[0]?.id;

  const callsRef = useMemoFirebase(() => {
    if (!user || !firestore || !agentId) return null;
    const callsCol = collection(firestore, `businessProfiles/${userIdSlug}/agents/${agentId}/conversations`);
    if (businessProfile && businessProfile.currentRenterId === user.uid) {
      return query(callsCol, where('assignedRenterId', '==', user.uid));
    }
    return query(callsCol);
  }, [user, firestore, userIdSlug, agentId, businessProfile]);

  const { data: callsData, isLoading: isCallsLoading } = useCollection(callsRef);

  const leadsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const leadsCol = collection(firestore, `businessProfiles/${userIdSlug}/leads`);
    if (businessProfile && businessProfile.currentRenterId === user.uid) {
      return query(leadsCol, where('assignedRenterId', '==', user.uid));
    }
    return query(leadsCol);
  }, [user, firestore, userIdSlug, businessProfile]);

  const { data: leadsData, isLoading: isLeadsLoading } = useCollection(leadsRef);

  const appointmentsRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const apptsCol = collection(firestore, `businessProfiles/${userIdSlug}/appointments`);
    if (businessProfile && businessProfile.currentRenterId === user.uid) {
      return query(apptsCol, where('assignedRenterId', '==', user.uid));
    }
    return query(apptsCol);
  }, [user, firestore, userIdSlug, businessProfile]);

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useCollection(appointmentsRef);

  if (isProfileLoading || isAgentsLoading || isCallsLoading || isLeadsLoading || isAppointmentsLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  const parseDate = (val: any) => {
    if (!val) return new Date();
    if (typeof val.toDate === 'function') return val.toDate();
    if (val.seconds) return new Date(val.seconds * 1000);
    return new Date(val);
  };

  const calls = ((callsData || []) as CallLog[]).sort((a, b) => {
    const timeA = parseDate(a.startedAt).getTime();
    const timeB = parseDate(b.startedAt).getTime();
    return timeB - timeA; // Descending order for the sidebar list of conversations
  });
  const leads = (leadsData || []) as Lead[];
  const appointments = (appointmentsData || []) as Appointment[];
  
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
                {filteredCalls.map(call => {
                  const lead = leads.find(l => l.id === call.leadId);
                  const callerName = lead?.name || 'Unknown Caller';

                  return (
                    <button
                      key={call.callSid}
                      onClick={() => setSelectedCallId(call.callSid)}
                      className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selectedCall?.callSid === call.callSid ? 'bg-muted' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">
                            {call.outcome === 'answered' ? <PhoneCall className="h-4 w-4 text-green-500" /> : call.outcome === 'missed' ? <PhoneMissed className="h-4 w-4 text-red-500" /> : <PhoneIncoming className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-base leading-none mb-1.5">{formatPhoneNumber(call.callerNumber) || 'Unknown Caller'}</span>
                            <span className="text-sm text-muted-foreground">{callerName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(call.duration)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Middle Column: Chat Transcript */}
        <div className="flex flex-col overflow-hidden bg-muted/5">
          <div className="p-4 border-b shrink-0 flex items-center justify-between bg-background">
            <div>
              <h2 className="font-semibold">{selectedCall ? formatPhoneNumber(selectedCall.callerNumber) || 'Transcript' : 'Transcript'}</h2>
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
                <div className="bg-card border rounded-lg p-6 shadow-sm whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedCall.transcript || <span className="italic text-muted-foreground">No transcript recorded for this call.</span>}
                </div>
              </div>
            )}
          </div>
           
          {selectedCall && (
            <div className="p-4 border-t bg-background shrink-0 space-y-4">
              {selectedCall.recordingUrl ? (
                <div className="w-full">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Call Recording</span>
                  <audio controls className="w-full h-10 outline-none" src={selectedCall.recordingUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center p-4 bg-muted/20 rounded-md border border-dashed">
                  <span className="text-sm text-muted-foreground">No recording available for this call.</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                      <span>Duration: {formatDuration(selectedCall.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild disabled={!selectedCall.recordingUrl}>
                        <a href={selectedCall.recordingUrl || '#'} target="_blank" rel="noreferrer" download>
                          <Download className="h-4 w-4 mr-2" /> Download Audio
                        </a>
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
              <Card className="border-primary/20 shadow-sm">
                  <CardHeader className="pb-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-semibold">Call Summary</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="text-sm pt-4 space-y-4">
                      {(() => {
                        const callAppointment = appointments.find(apt => apt.phone === selectedCall.callerNumber || (selectedCall.leadId && apt.leadId === selectedCall.leadId)) || null;
                        const result = getCallResult(selectedCall, callAppointment);
                        return (
                          <div className={`p-3 rounded-md border ${result.color}`}>
                            <p className="font-semibold">{result.title}</p>
                            <p className="opacity-90 mt-1">{result.description}</p>
                          </div>
                        );
                      })()}
                      <p className="text-foreground leading-relaxed pt-2 border-t">
                        <span className="font-semibold block mb-1 text-muted-foreground">AI Notes:</span>
                        {selectedCall.summary || <span className="text-muted-foreground italic">No summary available.</span>}
                      </p>
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
