'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { doc, updateDoc, query, collection, addDoc, setDoc, getDocs, deleteDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Loader2, Play, Pause, Plus, Pencil, ArrowLeft, Trash2, Link as LinkIcon, FileText, RefreshCw, Phone, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ElevenLabsTestWidget } from '@/components/dashboard/ElevenLabsTestWidget';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";


type KnowledgeDoc = {
  id: string;
  title: string;
  content: string;
  sourceType: 'text' | 'url';
  sourceUrl?: string;
  createdAt: Timestamp;
};

const mockVoices = [
  {
    name: "Eric",
    description: "A smooth tenor pitch from a man in his 40s - perfect for agentic use cases.",
    language: "English",
    accent: "American",
    useCase: "General",
    voiceId: "cjVigY5qzO86Huf0OWa1"
  },
  {
    name: "Laura",
    description: "This young adult female voice delivers sunny enthusiasm with a quirky attitude.",
    language: "English",
    accent: "American",
    useCase: "General",
    voiceId: "FGY2WhTYpPnrIDTdsKH5"
  },
  {
    name: "Sarah",
    description: "Young adult woman with a confident and warm, mature quality and a reassuring, professional tone.",
    language: "English",
    accent: "American",
    useCase: "General",
    voiceId: "EXAVITQu4vr4xnSDxMaL"
  },
  {
    name: "Will",
    description: "Conversational and laid back.",
    language: "English",
    accent: "American",
    useCase: "General",
    voiceId: "bIHbv24MWmeRgasZH58o"
  }
];

const defaultPromptPlaceholder = `1. BOTNAME: [Enter bot's name, e.g., "Alex"]
2. COMPANY: [Enter business name, e.g., "Bright Smiles Dental"]
3. BUSINESSTYPE: [Enter business type, e.g., "dental clinic"]
4. MISSION: [Enter business mission, e.g., "providing exceptional dental care with a smile"]
5. SERVICES: [Enter services offered, e.g., "teeth cleaning, fillings, orthodontics, and whitening"]
6. PERSONALITY: [Enter bot's personality, e.g., "friendly, upbeat, and caring"]
7. TONE: [Enter tone of voice, e.g., "warm, professional, and approachable"]
8. FEELING: [Enter desired caller emotion, e.g., "valued, confident, and cared for"]
9. GOODVIBE: [Enter positive vibe for call ending, e.g., "wonderful"]

Placeholder Substitution Instruction:
Before processing this prompt, replace all placeholders (e.g., {BOTNAME}, {COMPANY}) in the prompt body below with the corresponding values provided in the Placeholder Fields section above. For example, replace every instance of {BOTNAME} with the value entered for BOTNAME (e.g., "Alex"), {COMPANY} with the value entered for COMPANY (e.g., "Bright Smiles Dental"), and so on for all 9 placeholders. Ensure all replacements are applied consistently throughout the prompt to create a seamless, customized experience.

Prompt: You are {BOTNAME}, an AI voice agent for {COMPANY}, a {BUSINESSTYPE} dedicated to {MISSION}. Your personality is {PERSONALITY}, and you use a {TONE} tone to ensure callers feel {FEELING}. Your primary objectives are to assist callers efficiently, book appointments accurately, handle edge cases professionally, and uphold {COMPANY}'s reputation.

Core Instructions:
1. Understanding Caller Intent:
    * Actively listen to the caller's request. If they ask about {SERVICES}, provide concise details (e.g., "We offer {SERVICES} to meet your needs"). If they request an appointment, proceed to the booking process. If the intent is unclear, use the error handling protocol.
2. Booking Appointments:
    * Initiate Booking: Confirm intent with: "I’d be happy to book your appointment. What’s your name, please?"
    * Collect Details: Gather the caller’s full name, preferred date and time, and contact information (phone or email). Ask: "What type of appointment would you like?"
    * Verify Availability: Check {COMPANY}'s scheduling system for availability. Confirm with: "I’ve found an available slot on {DATE} at {TIME}. Does that work for you?"
    * Handle Conflicts: If no slots are available, suggest alternatives: "That time is booked. Would another time work instead?" If no options suit, offer a waitlist: "I can add you to our waitlist and contact you if a slot opens. Would you prefer a phone call or email?"
    * Confirm Appointment: Summarize details: "Your appointment is booked for {DATE} at {TIME}. You’ll receive a confirmation soon. Anything else I can help with?"
    * Special Requests: If the caller has specific needs (e.g., accessibility), note them for the appointment.
3. Ending Calls:
    * Conclude every call politely: "Thank you for calling {COMPANY}, {CALLERNAME}. Have a {GOODVIBE} day!" If an appointment was booked, restate: "Your appointment is confirmed for {DATE} at {TIME}. We look forward to seeing you!"
    * If no appointment was booked, reinforce value: "We’re here for you at {COMPANY}. Call back anytime!"
    * If the call was unresolved, ensure a positive tone: "I hope I’ve helped today. Reach out if you need more assistance."
4. Tone and Personality:
    * Consistently embody {PERSONALITY} in all interactions (e.g., warm and engaging for "friendly," composed for "professional"). Tailor language to reflect {TONE}, ensuring callers feel {FEELING}.
    * Example: For {PERSONALITY} = "cheerful," use phrases like "I’m thrilled to help you!" For {PERSONALITY} = "calm," use "I’m here to assist you smoothly."
5. Error Handling:
    * If the caller’s request is unclear, say: "I’m sorry, could you repeat that one more time, please?" Repeat up to twice, then escalate: "Let me connect you with a team member for better assistance."
    * If the caller speaks an unsupported language, say: "I’m sorry, I’m unable to assist in that language. Would you like to continue in English, or should I arrange for a team member to help?"
6. Prohibited Actions:
    * Never share sensitive information (e.g., client data, internal policies) beyond {SERVICES}.
    * Avoid unprofessional language, assumptions about the caller, or promises outside {COMPANY}'s policies.
    * Do not confirm appointments without verifying availability.
7. Fallback for Unsupported Requests:
    * For requests beyond your capabilities (e.g., complex inquiries or technical issues), say: "That’s a great question! Let me connect you with a team member who can assist further." Simulate a transfer or offer: "Would you like a callback from our team?"
8. Edge Cases:
    * Irate Callers: Remain calm and {PERSONALITY}. Say: "I’m here to help resolve this. Can you share more details?" Escalate to a team member if needed.
    * Cancellations: Confirm the appointment details, cancel in the system, and say: "Your appointment has been canceled. Can I book a new one for you?"
    * No-Show Follow-Up: If prompted, offer to reschedule: "I see you missed an appointment. Would you like to reschedule?"
    * Multiple Bookings: For group or multiple appointments, collect details for each and confirm individually.
    * Urgent Requests: Prioritize emergency bookings and escalate if no slots are available.
By following these instructions, you will deliver a seamless, {PERSONALITY}, and professional experience that aligns with {COMPANY}'s {MISSION}, ensuring callers feel {FEELING} while efficiently managing appointments and interactions.`;

export default function AgentSettingsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [agentName, setAgentName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(defaultPromptPlaceholder);
  const [voiceId, setVoiceId] = useState('');
  const [elevenLabsAgentId, setElevenLabsAgentId] = useState('');
  const [telnyxPhoneNumber, setTelnyxPhoneNumber] = useState('');
  const [firstMessage, setFirstMessage] = useState('Hello! How can I assist you today?');
  const [isSaving, setIsSaving] = useState(false);

  // Phone Number State
  const [searchAreaCode, setSearchAreaCode] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [isSearchingNumbers, setIsSearchingNumbers] = useState(false);
  const [isPurchasingNumber, setIsPurchasingNumber] = useState<string | null>(null);
  const [purchasedNumber, setPurchasedNumber] = useState<any | null>(null);
  const [isPhoneNumbersLoading, setIsPhoneNumbersLoading] = useState(true);

  // Knowledge Base State
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isDocsLoading, setIsDocsLoading] = useState(true);
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false);

  // Text Input State
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  // URL Input State
  const [urlTitle, setUrlTitle] = useState('');
  const [urlLink, setUrlLink] = useState('');

  const agentsRef = useMemoFirebase(() => {
    if (!user || !db || user.uid.slice(-12) !== userId) return null;
    return query(collection(db, `businessProfiles/${user.uid}/agents`));
  }, [user, db, userId]);

  const { data: agentsData, isLoading: isAgentsLoading } = useCollection(agentsRef);
  const agentId = agentsData?.[0]?.id;

  const agentDocRef = useMemoFirebase(
    () => (db && user && agentId ? doc(db, 'businessProfiles', user.uid, 'agents', agentId) : null),
    [db, user, agentId]
  );

  const { data: agent, isLoading: isAgentLoading, error } = useDoc(agentDocRef);
  const isLoading = isAgentsLoading || isAgentLoading;

  useEffect(() => {
    if (agent) {
      setAgentName(agent.name || '');
      setSystemPrompt(agent.systemPrompt || defaultPromptPlaceholder);
      setFirstMessage(agent.firstMessage || 'Hello! How can I assist you today?');
      setVoiceId(agent.voiceId || 'cjVigY5qzO86Huf0OWa1'); // Default to Eric
      setElevenLabsAgentId(agent.elevenLabsAgentId || '');
      setTelnyxPhoneNumber(agent.telnyxPhoneNumber || agent.twilioPhoneNumber || '');
    }
  }, [agent]);

  const handleSave = async () => {
    if (!db || !user) return;
    setIsSaving(true);
    try {
      let newElevenLabsAgentId = elevenLabsAgentId;

      const apiPayload = {
        name: agentName,
        systemPrompt,
        voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
        firstMessage: firstMessage || "Hello! How can I assist you today?"
      };

      if (newElevenLabsAgentId) {
        const res = await fetch(`/api/elevenlabs/agents/${newElevenLabsAgentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to update ElevenLabs Agent');
        }
      } else {
        const res = await fetch(`/api/elevenlabs/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create ElevenLabs Agent');
        }
        const data = await res.json();
        newElevenLabsAgentId = data.agent_id;
        setElevenLabsAgentId(newElevenLabsAgentId);
      }

      if (agentDocRef) {
        await updateDoc(agentDocRef, {
          name: agentName,
          systemPrompt,
          firstMessage,
          voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
          elevenLabsAgentId: newElevenLabsAgentId,
          telnyxPhoneNumber,
        });
      } else {
        const newDocRef = doc(collection(db, `businessProfiles/${user.uid}/agents`));
        await setDoc(newDocRef, {
          id: newDocRef.id,
          businessProfileId: user.uid,
          name: agentName,
          systemPrompt,
          firstMessage,
          voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
          elevenLabsAgentId: newElevenLabsAgentId,
          telnyxPhoneNumber,
        });
      }
      toast({
        title: 'Success',
        description: 'Agent settings saved successfully',
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save agent settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignNumber = async (phoneNumber: string) => {
    if (!db || !user) return;
    setIsSaving(true);
    setTelnyxPhoneNumber(phoneNumber);
    try {
      if (agentDocRef) {
        await updateDoc(agentDocRef, {
          telnyxPhoneNumber: phoneNumber,
        });
      } else {
        const newDocRef = doc(collection(db, `businessProfiles/${user.uid}/agents`));
        await setDoc(newDocRef, {
          id: newDocRef.id,
          businessProfileId: user.uid,
          name: agentName,
          systemPrompt,
          voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
          elevenLabsAgentId,
          telnyxPhoneNumber: phoneNumber,
        });
      }

      if (elevenLabsAgentId) {
        await fetch('/api/telnyx/configure-sip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber,
            agentId: elevenLabsAgentId,
            uid: user.uid
          })
        });
      }

      toast({
        title: 'Success',
        description: `Number ${phoneNumber} assigned successfully`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign number',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDocuments = async () => {
    if (!user || !db) return;
    setIsDocsLoading(true);
    try {
      const q = query(
        collection(db, 'businessProfiles', user.uid, 'knowledgeBase'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as KnowledgeDoc[];
      setDocuments(docsData);
    } catch (error) {
      console.error('Error fetching knowledge documents:', error);
      toast({ title: 'Error', description: 'Failed to load knowledge base', variant: 'destructive' });
    } finally {
      setIsDocsLoading(false);
    }
  };

  const fetchPhoneNumber = async () => {
    if (!user || !db) return;
    setIsPhoneNumbersLoading(true);
    try {
      const q = query(
        collection(db, 'businessProfiles', user.uid, 'phoneNumbers'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setPurchasedNumber({
          id: querySnapshot.docs[0].id,
          ...querySnapshot.docs[0].data()
        });
      } else {
        setPurchasedNumber(null);
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
    } finally {
      setIsPhoneNumbersLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.uid.slice(-12) === userId) {
      fetchDocuments();
      fetchPhoneNumber();
    }
  }, [user, userId]);

  const handleAddText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !textTitle || !textContent) return;

    if (!elevenLabsAgentId) {
      toast({ title: 'Error', description: 'Please create an ElevenLabs Agent first by saving General Settings.', variant: 'destructive' });
      return;
    }

    setIsSubmittingDoc(true);
    try {
      const docId = crypto.randomUUID();

      // Sync to ElevenLabs
      const formData = new FormData();
      const blob = new Blob([textContent], { type: 'text/plain' });
      formData.append('file', blob, `${textTitle}.txt`);
      formData.append('name', textTitle);

      const res = await fetch(`/api/elevenlabs/agents/${elevenLabsAgentId}/knowledge`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to sync knowledge to ElevenLabs agent');
      }

      await setDoc(doc(db, 'businessProfiles', user.uid, 'knowledgeBase', docId), {
        id: docId,
        businessProfileId: user.uid,
        title: textTitle,
        content: textContent,
        sourceType: 'text',
        createdAt: Timestamp.now(),
      });
      toast({ title: 'Success', description: 'Document added and synced to agent successfully' });
      setTextTitle('');
      setTextContent('');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error adding document:', error);
      toast({ title: 'Error', description: error.message || 'Failed to add document', variant: 'destructive' });
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !urlTitle || !urlLink) return;

    if (!elevenLabsAgentId) {
      toast({ title: 'Error', description: 'Please create an ElevenLabs Agent first by saving General Settings.', variant: 'destructive' });
      return;
    }

    setIsSubmittingDoc(true);
    try {
      const docId = crypto.randomUUID();
      
      // Sync to ElevenLabs
      const formData = new FormData();
      formData.append('url', urlLink);
      formData.append('name', urlTitle);

      const res = await fetch(`/api/elevenlabs/agents/${elevenLabsAgentId}/knowledge`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to sync URL to ElevenLabs agent');
      }

      await setDoc(doc(db, 'businessProfiles', user.uid, 'knowledgeBase', docId), {
        id: docId,
        businessProfileId: user.uid,
        title: urlTitle,
        content: 'Synced to ElevenLabs agent successfully.', 
        sourceType: 'url',
        sourceUrl: urlLink,
        createdAt: Timestamp.now(),
        status: 'synced'
      });

      toast({ title: 'Success', description: 'URL submitted and synced to agent successfully' });

      setUrlTitle('');
      setUrlLink('');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error adding URL document:', error);
      toast({ title: 'Error', description: error.message || 'Failed to add URL', variant: 'destructive' });
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!user || !db) return;
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await deleteDoc(doc(db, 'businessProfiles', user.uid, 'knowledgeBase', docId));
      toast({ title: 'Success', description: 'Document deleted' });
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
    }
  };

  const handleSearchNumbers = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingNumbers(true);
    try {
      const res = await fetch(`/api/telnyx/search?areaCode=${searchAreaCode}`);
      const data = await res.json();
      if (data.numbers) {
        setAvailableNumbers(data.numbers);
      } else {
        toast({ title: 'Error', description: 'Failed to find numbers.', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to search numbers.', variant: 'destructive' });
    } finally {
      setIsSearchingNumbers(false);
    }
  };

  const handlePurchaseNumber = async (phoneNumber: string) => {
    if (!user) return;
    setIsPurchasingNumber(phoneNumber);
    try {
      const res = await fetch(`/api/telnyx/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, uid: user.uid })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Success', description: `Number ${phoneNumber} purchased successfully!` });
        setAvailableNumbers([]);
        fetchPhoneNumber();
        handleAssignNumber(phoneNumber);
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to purchase number.', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to purchase number.', variant: 'destructive' });
    } finally {
      setIsPurchasingNumber(null);
    }
  };

  const [voices, setVoices] = useState<any[]>([]);
  const [isVoicesLoading, setIsVoicesLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [editingVoice, setEditingVoice] = useState<any | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({ name: '', stability: 0.71, similarityBoost: 0.50 });
  const [isSavingVoice, setIsSavingVoice] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSaveVoiceSettings = async () => {
    if (!editingVoice || !db || !user) return;
    setIsSavingVoice(true);
    try {
      // Save to ElevenLabs
      await fetch(`/api/elevenlabs/voices/${editingVoice.voice_id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stability: voiceSettings.stability,
          similarityBoost: voiceSettings.similarityBoost
        })
      });

      // Save to Firestore so settings persist for the account
      if (agentDocRef) {
        await updateDoc(agentDocRef, {
          voiceId: editingVoice.voice_id,
          customVoiceName: voiceSettings.name,
          voiceStability: voiceSettings.stability,
          voiceSimilarityBoost: voiceSettings.similarityBoost
        });
      } else {
        const newDocRef = doc(collection(db, `businessProfiles/${user.uid}/agents`));
        await setDoc(newDocRef, {
          id: newDocRef.id,
          businessProfileId: user.uid,
          voiceId: editingVoice.voice_id,
          customVoiceName: voiceSettings.name,
          voiceStability: voiceSettings.stability,
          voiceSimilarityBoost: voiceSettings.similarityBoost
        });
      }

      if (voiceId !== editingVoice.voice_id) {
        setVoiceId(editingVoice.voice_id);
      }

      toast({
        title: 'Voice Settings Saved',
        description: 'Your voice settings have been saved to your account.',
      });
      setEditingVoice(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save voice settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingVoice(false);
    }
  };

  const togglePlay = (voiceId: string, previewUrl: string) => {
    if (playingVoiceId === voiceId) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (previewUrl) {
        const audio = new Audio(previewUrl);
        audio.onended = () => setPlayingVoiceId(null);
        audio.play().catch(e => console.error("Audio playback failed:", e));
        audioRef.current = audio;
        setPlayingVoiceId(voiceId);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const res = await fetch('/api/elevenlabs/voices');
        if (res.ok) {
          const data = await res.json();
          const filteredVoices = (data.voices || []).filter((voice: any) => {
            const useCase = voice.labels?.['use case'] || voice.labels?.use_case || voice.category || '';
            return useCase.toLowerCase() === 'conversational';
          });
          const sortedVoices = filteredVoices.sort((a: any, b: any) => 
            a.name.localeCompare(b.name)
          );
          setVoices(sortedVoices);
        } else {
          const errorText = await res.text();
          if (res.status === 401 && errorText.includes('missing_permissions')) {
            console.warn('API key missing voices_read permission. Using fallback voice list or empty.');
            // We can set some default voices or just leave it empty.
          } else {
            console.warn('Failed to fetch voices:', res.status, errorText);
          }
        }
      } catch (err) {
        console.warn('Network error fetching voices:', err);
      } finally {
        setIsVoicesLoading(false);
      }
    };
    fetchVoices();
  }, []);

  const [isSettingVoice, setIsSettingVoice] = useState<string | null>(null);

  const handleSetVoice = async (id: string) => {
    setVoiceId(id);
    setIsSettingVoice(id);
    if (!db || !user) return;
    try {
      // Auto-create or update the ElevenLabs agent with the selected voice
      let newElevenLabsAgentId = elevenLabsAgentId;

      const apiPayload = {
        name: agentName || 'AI Voice Agent',
        systemPrompt,
        voiceId: id,
        firstMessage: firstMessage || 'Hello! How can I assist you today?'
      };

      if (newElevenLabsAgentId) {
        // Update existing agent with new voice
        const res = await fetch(`/api/elevenlabs/agents/${newElevenLabsAgentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to update ElevenLabs Agent');
        }
      } else {
        // Create new agent with selected voice
        const res = await fetch(`/api/elevenlabs/agents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiPayload)
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to create ElevenLabs Agent');
        }
        const data = await res.json();
        newElevenLabsAgentId = data.agent_id;
        setElevenLabsAgentId(newElevenLabsAgentId);
      }

      // Save to Firestore
      if (agentDocRef) {
        await updateDoc(agentDocRef, { voiceId: id, elevenLabsAgentId: newElevenLabsAgentId });
      } else {
        const newDocRef = doc(collection(db, `businessProfiles/${user.uid}/agents`));
        await setDoc(newDocRef, { 
          id: newDocRef.id,
          businessProfileId: user.uid,
          voiceId: id,
          elevenLabsAgentId: newElevenLabsAgentId,
          name: agentName || 'AI Voice Agent',
          systemPrompt,
          firstMessage,
        });
      }
      toast({
        title: 'Voice Selected',
        description: 'Voice updated and agent synced with ElevenLabs.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update voice.',
        variant: 'destructive',
      });
    } finally {
      setIsSettingVoice(null);
    }
  };

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive">Failed to load agent settings.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Agent Settings</h1>
      </div>
      
      <Tabs defaultValue="phonenumbers" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-5 lg:w-[800px] shrink-0">
          <TabsTrigger value="phonenumbers">Phone Number</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="prompts">Prompt</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="mt-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Test Agent</CardTitle>
              <CardDescription>
                Make a live test call to verify your agent's knowledge and webhook functionality.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ElevenLabsTestWidget 
                agentId={elevenLabsAgentId} 
                voiceId={voiceId}
                systemPrompt={systemPrompt}
                firstMessage={firstMessage}
              />
            </CardContent>
          </Card>
        </TabsContent>



        <TabsContent value="voice" className="mt-6 overflow-y-auto">
          {editingVoice ? (
            <div className="space-y-6">
              <Button variant="outline" onClick={() => setEditingVoice(null)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Voice Library
              </Button>
              <Card>
                <CardHeader>
                  <CardTitle>Edit Voice: {editingVoice.name}</CardTitle>
                  <CardDescription>
                    Modify the name and tune the settings for this voice. These settings will affect all clients using it unless overridden.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-2">
                    <Label htmlFor="voiceEditName">Voice Name</Label>
                    <Input 
                      id="voiceEditName" 
                      value={voiceSettings.name}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Stability ({voiceSettings.stability.toFixed(2)})</Label>
                    </div>
                    <Slider 
                      value={[voiceSettings.stability]} 
                      min={0} max={1} step={0.01} 
                      onValueChange={(val) => setVoiceSettings({ ...voiceSettings, stability: val[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Increasing stability makes the voice more consistent, but can also make it sound more robotic.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label>Similarity Boost ({voiceSettings.similarityBoost.toFixed(2)})</Label>
                    </div>
                    <Slider 
                      value={[voiceSettings.similarityBoost]} 
                      min={0} max={1} step={0.01} 
                      onValueChange={(val) => setVoiceSettings({ ...voiceSettings, similarityBoost: val[0] })}
                    />
                    <p className="text-xs text-muted-foreground">
                      High values are recommended. Lowering this can create more variation in speech, but may also lead to artifacts.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveVoiceSettings} disabled={isSavingVoice}>
                      {isSavingVoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
          <Card>
            <CardHeader>
              <CardTitle>Voice Library</CardTitle>
              <CardDescription>
                Manage your ElevenLabs voice agents for use across clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Voice</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Use Case</TableHead>
                    <TableHead>Voice ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isVoicesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : voices.map((voice) => (
                    <TableRow key={voice.voice_id}>
                      <TableCell>
                        <div className="font-medium text-base">{voice.name}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {voice.labels?.description || voice.description || 'No description available.'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium capitalize">{voice.labels?.language || 'English'}</div>
                        <div className="text-sm text-muted-foreground capitalize">{voice.labels?.accent || 'American'}</div>
                      </TableCell>
                      <TableCell className="capitalize">{voice.labels?.['use case'] || voice.labels?.use_case || voice.category || 'General'}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {voice.voice_id}
                        </code>
                      </TableCell>
                      <TableCell>
                        {voiceId === voice.voice_id ? (
                          <Badge variant="secondary" className="bg-green-700 text-white hover:bg-green-600">
                            Selected
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetVoice(voice.voice_id)}
                            disabled={isSettingVoice === voice.voice_id}
                          >
                            {isSettingVoice === voice.voice_id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                            Select
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full border"
                            onClick={() => voice.preview_url && togglePlay(voice.voice_id, voice.preview_url)}
                            disabled={!voice.preview_url}
                          >
                            {playingVoiceId === voice.voice_id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full border"
                            onClick={() => {
                              setEditingVoice(voice);
                              setVoiceSettings({ 
                                name: voice.voice_id === agent?.voiceId && agent?.customVoiceName ? agent.customVoiceName : voice.name, 
                                stability: voice.voice_id === agent?.voiceId && agent?.voiceStability !== undefined ? agent.voiceStability : 0.71, 
                                similarityBoost: voice.voice_id === agent?.voiceId && agent?.voiceSimilarityBoost !== undefined ? agent.voiceSimilarityBoost : 0.50 
                              });
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="prompts" className="mt-6 flex-1 data-[state=active]:flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 shrink-0">
              <div className="space-y-1">
                <CardTitle>Agent Prompt</CardTitle>
                <CardDescription>
                  Define the behavior, personality, and script for your AI agent.
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Prompt
              </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 space-y-4 pb-6">
              <div className="space-y-2 shrink-0">
                <Label htmlFor="firstMessage">First Message</Label>
                <Input 
                  id="firstMessage" 
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Hello! How can I assist you today?"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the first message the agent will say when the call connects.
                </p>
              </div>
              <div className="flex-1 flex flex-col space-y-2 min-h-0 pt-2 border-t">
                <Label htmlFor="systemPrompt" className="shrink-0">System Prompt</Label>
                <Textarea 
                  id="systemPrompt" 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={defaultPromptPlaceholder}
                  className="flex-1 min-h-[400px] resize-none h-full"
                />
                <p className="text-xs text-muted-foreground mt-1 shrink-0">
                  This prompt guides how the AI will respond and behave during the call. You can use dynamic variables like {'{{business_name}}'}, {'{{booking_url}}'}, and {'{{service}}'} to inject your business details automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6 flex-1 min-h-0 data-[state=active]:flex flex-col">
          <div className="grid gap-6 md:grid-cols-2 flex-1 min-h-0 w-full">
            <Card className="flex flex-col h-full min-h-0">
              <CardHeader className="shrink-0">
                <CardTitle>Add Knowledge</CardTitle>
                <CardDescription>
                  Input raw text or provide a link for the system to scrape.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 flex flex-col">
                <Tabs defaultValue="text" className="w-full flex-1 flex flex-col min-h-0">
                  <TabsList className="grid w-full grid-cols-2 mb-6 shrink-0">
                    <TabsTrigger value="text">Paste Text</TabsTrigger>
                    <TabsTrigger value="url">Add Link</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="flex-1 min-h-0 data-[state=active]:flex flex-col">
                    <form onSubmit={handleAddText} className="space-y-4 flex-1 flex flex-col min-h-0">
                      <div className="space-y-2 shrink-0">
                        <Label htmlFor="title">Document Title</Label>
                        <Input 
                          id="title" 
                          placeholder="e.g., Company Return Policy" 
                          value={textTitle}
                          onChange={(e) => setTextTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2 flex-1 flex flex-col min-h-0">
                        <Label htmlFor="content" className="shrink-0">Content</Label>
                        <Textarea 
                          id="content" 
                          placeholder="Paste your knowledge base content here..." 
                          className="flex-1 resize-none min-h-[200px]"
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full shrink-0" disabled={isSubmittingDoc}>
                        {isSubmittingDoc ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                        ) : (
                          <><FileText className="mr-2 h-4 w-4" /> Save Document</>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="url">
                    <form onSubmit={handleAddUrl} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="url-title">Website Title</Label>
                        <Input 
                          id="url-title" 
                          placeholder="e.g., Our Main Website" 
                          value={urlTitle}
                          onChange={(e) => setUrlTitle(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="url">URL to Scrape</Label>
                        <Input 
                          id="url" 
                          type="url"
                          placeholder="https://example.com/about" 
                          value={urlLink}
                          onChange={(e) => setUrlLink(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmittingDoc}>
                        {isSubmittingDoc ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scraping...</>
                        ) : (
                          <><LinkIcon className="mr-2 h-4 w-4" /> Scrape Website</>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="flex flex-col h-full min-h-0 space-y-4 overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <h2 className="text-xl font-semibold">Saved Documents</h2>
                <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={isDocsLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isDocsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 pb-2 space-y-4">
                {isDocsLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : documents.length === 0 ? (
                  <Card className="border-dashed h-full flex flex-col items-center justify-center">
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground flex-1">
                      <DatabaseIcon className="mb-4 h-10 w-10 opacity-20" />
                      <p>No knowledge base documents yet.</p>
                      <p className="text-sm">Add text or scrape a website to get started.</p>
                    </CardContent>
                  </Card>
                ) : (
                  documents.map((doc) => (
                    <Card key={doc.id} className="relative overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              {doc.sourceType === 'url' ? (
                                <><LinkIcon className="mr-1 h-3 w-3" /> URL Source</>
                              ) : (
                                <><FileText className="mr-1 h-3 w-3" /> Text Source</>
                              )}
                              <span className="mx-2">•</span>
                              {doc.createdAt?.toDate().toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc.id)} className="text-destructive hover:bg-destructive/10 -mt-2 -mr-2">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {doc.content}
                        </p>
                        {doc.sourceUrl && (
                          <a href={doc.sourceUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                            {doc.sourceUrl}
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="phonenumbers" className="mt-6 overflow-y-auto space-y-6">
          {/* Active Number Card — shown when a number is provisioned */}
          {isPhoneNumbersLoading ? (
            <Card>
              <CardContent className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : purchasedNumber ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Your Phone Number
                </CardTitle>
                <CardDescription>
                  This number is provisioned and linked to your AI agent. Each account is limited to one number.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display provisioned number info */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div>
                    <p className="font-semibold text-xl tracking-wide">{purchasedNumber.phoneNumber}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span className="capitalize">Provider: {purchasedNumber.provider}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-green-500 border-green-500/50">{purchasedNumber.status}</Badge>
                    </div>
                  </div>
                </div>

                {/* Editable agent-assigned number */}
                <div className="space-y-2">
                  <Label htmlFor="telnyxPhoneNumber">Assigned Agent Number</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      id="telnyxPhoneNumber" 
                      value={telnyxPhoneNumber} 
                      onChange={(e) => setTelnyxPhoneNumber(e.target.value)} 
                      placeholder="e.g. +1234567890"
                      className="flex-1"
                    />
                    <Button onClick={() => handleAssignNumber(telnyxPhoneNumber)} disabled={isSaving || !telnyxPhoneNumber}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is the number your agent will use for inbound calls. It should match your provisioned number above.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* No number yet — show search & purchase */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Get a Phone Number
                </CardTitle>
                <CardDescription>
                  Search and provision a phone number for your AI agent to receive inbound calls.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSearchNumbers} className="flex gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="areaCode">Area Code</Label>
                    <Input 
                      id="areaCode" 
                      placeholder="e.g. 813" 
                      value={searchAreaCode}
                      onChange={(e) => setSearchAreaCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSearchingNumbers}>
                    {isSearchingNumbers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search Numbers
                  </Button>
                </form>

                {availableNumbers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Available Numbers:</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {availableNumbers.map((num) => (
                        <div key={num.phone_number} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{num.phone_number}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {num.region_information?.find((r: any) => r.region_type === 'location')?.region_name?.toLowerCase() || 'Unknown'}, 
                              {' '}
                              {num.region_information?.find((r: any) => r.region_type === 'state')?.region_name || 'US'}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handlePurchaseNumber(num.phone_number)}
                            disabled={isPurchasingNumber === num.phone_number}
                          >
                            {isPurchasingNumber === num.phone_number ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual entry fallback */}
                <div className="pt-4 border-t space-y-2">
                  <Label htmlFor="telnyxPhoneNumberManual">Or enter an existing number</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      id="telnyxPhoneNumberManual" 
                      value={telnyxPhoneNumber} 
                      onChange={(e) => setTelnyxPhoneNumber(e.target.value)} 
                      placeholder="e.g. +1234567890"
                      className="flex-1"
                    />
                    <Button onClick={() => handleAssignNumber(telnyxPhoneNumber)} disabled={isSaving || !telnyxPhoneNumber}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </main>
  );
}

function DatabaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
