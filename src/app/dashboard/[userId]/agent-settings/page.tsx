'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { doc, updateDoc, query, collection, addDoc, setDoc, getDocs, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { Loader2, Play, Pause, Plus, Pencil, ArrowLeft, Trash2, Link as LinkIcon, FileText, RefreshCw, Phone, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export default function AgentSettingsPage() {
  const params = useParams();
  const userId = params.userId as string;
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [agentName, setAgentName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [elevenLabsAgentId, setElevenLabsAgentId] = useState('');
  const [twilioPhoneNumber, setTwilioPhoneNumber] = useState('');
  const [transcriberProvider, setTranscriberProvider] = useState('deepgram');
  const [transcriberModel, setTranscriberModel] = useState('nova-2');
  const [transcriberConfidence, setTranscriberConfidence] = useState(0.40);
  const [transcriberDenoising, setTranscriberDenoising] = useState(true);
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
      setSystemPrompt(agent.systemPrompt || '');
      setVoiceId(agent.voiceId || 'cjVigY5qzO86Huf0OWa1'); // Default to Eric
      setElevenLabsAgentId(agent.elevenLabsAgentId || '');
      setTwilioPhoneNumber(agent.twilioPhoneNumber || '');
      setTranscriberProvider(agent.transcriberProvider || 'deepgram');
      setTranscriberModel(agent.transcriberModel || 'nova-2');
      setTranscriberConfidence(agent.transcriberConfidence !== undefined ? agent.transcriberConfidence : 0.40);
      setTranscriberDenoising(agent.transcriberDenoising !== undefined ? agent.transcriberDenoising : true);
    }
  }, [agent]);

  const handleSave = async () => {
    if (!db || !user) return;
    setIsSaving(true);
    try {
      if (agentDocRef) {
        await updateDoc(agentDocRef, {
          name: agentName,
          systemPrompt,
          voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
          elevenLabsAgentId,
          twilioPhoneNumber,
          transcriberProvider,
          transcriberModel,
          transcriberConfidence,
          transcriberDenoising,
        });
      } else {
        await addDoc(collection(db, `businessProfiles/${user.uid}/agents`), {
          name: agentName,
          systemPrompt,
          voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
          elevenLabsAgentId,
          twilioPhoneNumber,
          transcriberProvider,
          transcriberModel,
          transcriberConfidence,
          transcriberDenoising,
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
    setTwilioPhoneNumber(phoneNumber);
    try {
      if (agentDocRef) {
        await updateDoc(agentDocRef, {
          twilioPhoneNumber: phoneNumber,
        });
      } else {
        await addDoc(collection(db, `businessProfiles/${user.uid}/agents`), {
          name: agentName,
          systemPrompt,
          voiceId: voiceId || 'cjVigY5qzO86Huf0OWa1',
          elevenLabsAgentId,
          twilioPhoneNumber: phoneNumber,
          transcriberProvider,
          transcriberModel,
          transcriberConfidence,
          transcriberDenoising,
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
        collection(db, 'businessProfiles', user.uid, 'phoneNumber'),
        orderBy('purchasedAt', 'desc')
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

    setIsSubmittingDoc(true);
    try {
      const docId = crypto.randomUUID();
      await setDoc(doc(db, 'businessProfiles', user.uid, 'knowledgeBase', docId), {
        id: docId,
        businessProfileId: user.uid,
        title: textTitle,
        content: textContent,
        sourceType: 'text',
        createdAt: Timestamp.now(),
      });
      toast({ title: 'Success', description: 'Document added successfully' });
      setTextTitle('');
      setTextContent('');
      fetchDocuments();
    } catch (error) {
      console.error('Error adding document:', error);
      toast({ title: 'Error', description: 'Failed to add document', variant: 'destructive' });
    } finally {
      setIsSubmittingDoc(false);
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !urlTitle || !urlLink) return;

    setIsSubmittingDoc(true);
    try {
      const docId = crypto.randomUUID();
      await setDoc(doc(db, 'businessProfiles', user.uid, 'knowledgeBase', docId), {
        id: docId,
        businessProfileId: user.uid,
        title: urlTitle,
        content: 'Scraping in progress...', 
        sourceType: 'url',
        sourceUrl: urlLink,
        createdAt: Timestamp.now(),
        status: 'scraping'
      });

      // Call API to scrape
      try {
        const response = await fetch('/api/knowledge/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: urlLink, docId: docId, uid: user.uid })
        });
        
        if (!response.ok) {
          throw new Error('Failed to scrape URL');
        }
        
        toast({ title: 'Success', description: 'URL submitted for scraping' });
      } catch (scrapeError) {
        console.error('Scraping error:', scrapeError);
        toast({ title: 'Error', description: 'Failed to scrape URL. It was saved as a reference.', variant: 'destructive' });
      }

      setUrlTitle('');
      setUrlLink('');
      fetchDocuments();
    } catch (error) {
      console.error('Error adding URL document:', error);
      toast({ title: 'Error', description: 'Failed to add URL', variant: 'destructive' });
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
        await addDoc(collection(db, `businessProfiles/${user.uid}/agents`), {
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
          console.error('Failed to fetch voices');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsVoicesLoading(false);
      }
    };
    fetchVoices();
  }, []);

  const handleSetVoice = async (id: string) => {
    setVoiceId(id);
    if (!db || !user) return;
    try {
      if (agentDocRef) {
        await updateDoc(agentDocRef, { voiceId: id });
      } else {
        await addDoc(collection(db, `businessProfiles/${user.uid}/agents`), { voiceId: id });
      }
      toast({
        title: 'Voice Updated',
        description: 'The default voice has been updated.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update voice.',
        variant: 'destructive',
      });
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
      
      <Tabs defaultValue="general" className="w-full flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-6 lg:w-[800px] shrink-0">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="voice">Voice</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="transcriber">Transcriber</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="phonenumbers">Phone Number</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure the basic identity of your AI Voice Agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input 
                  id="agentName" 
                  value={agentName} 
                  onChange={(e) => setAgentName(e.target.value)} 
                  placeholder="e.g. Solar London"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elevenLabsAgentId">ElevenLabs Agent ID</Label>
                <Input 
                  id="elevenLabsAgentId" 
                  value={elevenLabsAgentId} 
                  onChange={(e) => setElevenLabsAgentId(e.target.value)} 
                  placeholder="e.g. abcdef12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twilioPhoneNumber">Twilio/Telnyx Phone Number</Label>
                <Input 
                  id="twilioPhoneNumber" 
                  value={twilioPhoneNumber} 
                  onChange={(e) => setTwilioPhoneNumber(e.target.value)} 
                  placeholder="e.g. +1234567890"
                />
              </div>
              <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save General Settings
              </Button>
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
                    <TableHead>Default</TableHead>
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
                          <Badge variant="secondary" className="bg-slate-800 text-white hover:bg-slate-700">
                            Default
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetVoice(voice.voice_id)}
                          >
                            Make Default
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

        <TabsContent value="prompts" className="mt-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Agent Prompts</CardTitle>
              <CardDescription>
                Define the behavior, personality, and script for your AI agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea 
                  id="systemPrompt" 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are an AI sales assistant for..."
                  rows={8} 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt guides how the AI will respond and behave during the call. You can use dynamic variables like {'{{business_name}}'}, {'{{booking_url}}'}, and {'{{service}}'} to inject your business details automatically.
                </p>
              </div>
              <Button className="mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Prompts
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcriber" className="mt-6 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Default Transcriber</CardTitle>
              <CardDescription>
                This section allows you to configure the default speech-to-text (STT) settings for the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transcriberProvider">Provider</Label>
                  <Select value={transcriberProvider} onValueChange={setTranscriberProvider}>
                    <SelectTrigger id="transcriberProvider">
                      <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepgram">Deepgram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transcriberModel">Model</Label>
                  <Select value={transcriberModel} onValueChange={setTranscriberModel}>
                    <SelectTrigger id="transcriberModel">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nova-2">Nova 2</SelectItem>
                      <SelectItem value="nova-2-conversationalai">Nova 2 Conversational AI</SelectItem>
                      <SelectItem value="nova-3">Nova 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Confidence Threshold ({transcriberConfidence.toFixed(2)})</Label>
                </div>
                <Slider 
                  value={[transcriberConfidence]} 
                  min={0} max={1} step={0.01} 
                  onValueChange={(val) => setTranscriberConfidence(val[0])}
                />
                <p className="text-sm text-muted-foreground">
                  Transcripts below this confidence score are filtered out.
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4">
                <Switch 
                  id="denoising" 
                  checked={transcriberDenoising} 
                  onCheckedChange={setTranscriberDenoising} 
                />
                <Label htmlFor="denoising" className="font-normal">Enable Background Denoising</Label>
              </div>

              <Button className="mt-8" onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Transcriber Settings
              </Button>
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

        <TabsContent value="phonenumbers" className="mt-6 overflow-y-auto">
          {purchasedNumber ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Phone Number Provisioned</CardTitle>
                <CardDescription>
                  You have already provisioned a phone number for this account. Each account is limited to one phone number.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find a New Number (Telnyx)
                </CardTitle>
                <CardDescription>
                  Search and provision a new phone number instantly for your AI agent.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearchNumbers} className="flex gap-4 items-end mb-6">
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
                            <p className="text-xs text-muted-foreground capitalize">{num.locality || 'Unknown'}, {num.administrative_area || 'US'}</p>
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
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Your Provisioned Number
              </CardTitle>
              <CardDescription>
                Number provisioned through Twilio or Telnyx and linked to your agent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPhoneNumbersLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !purchasedNumber ? (
                <p className="text-sm text-muted-foreground">
                  No provisioned phone number yet. Use the search tool above to purchase one, or assign an existing number to your agent.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <p className="font-medium text-lg">{purchasedNumber.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">Provider: <span className="capitalize">{purchasedNumber.provider}</span> | Status: <Badge variant="outline">{purchasedNumber.status}</Badge></p>
                    </div>
                    <Button variant="outline" disabled={isSaving} onClick={() => handleAssignNumber(purchasedNumber.phoneNumber)}>
                      {isSaving && twilioPhoneNumber === purchasedNumber.phoneNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Assign to Agent
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
