'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Globe, 
  Phone, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  Play, 
  Pause, 
  AlertCircle, 
  Lock, 
  Mail,
  User,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import TranslatedText from '@/components/TranslatedText';

// Predefined voices matching dashboard agent-settings
const CONVERSATIONAL_VOICES = [
  {
    name: "Sarah (Recommended)",
    description: "Young adult woman with a warm, mature quality and a reassuring, professional tone.",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    previewUrl: "https://api.elevenlabs.io/v1/voices/EXAVITQu4vr4xnSDxMaL/previews" // Placeholder preview
  },
  {
    name: "Eric",
    description: "A smooth tenor pitch from a man in his 40s - perfect for professional services.",
    voiceId: "cjVigY5qzO86Huf0OWa1",
    previewUrl: "https://api.elevenlabs.io/v1/voices/cjVigY5qzO86Huf0OWa1/previews"
  },
  {
    name: "Laura",
    description: "This young adult female voice delivers sunny enthusiasm with a quirky attitude.",
    voiceId: "FGY2WhTYpPnrIDTdsKH5",
    previewUrl: "https://api.elevenlabs.io/v1/voices/FGY2WhTYpPnrIDTdsKH5/previews"
  },
  {
    name: "Will",
    description: "Conversational, laid back and friendly male voice.",
    voiceId: "bIHbv24MWmeRgasZH58o",
    previewUrl: "https://api.elevenlabs.io/v1/voices/bIHbv24MWmeRgasZH58o/previews"
  }
];

export default function RenterOnboardingPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const siteId = params.siteId as string;

  // Real-time Business Profile reference
  const businessProfileRef = useMemoFirebase(() => {
    if (!firestore || !siteId) return null;
    return doc(firestore, 'businessProfiles', siteId);
  }, [firestore, siteId]);

  const { data: businessProfile, isLoading: isProfileLoading } = useDoc<any>(businessProfileRef);

  // Wizard state
  const [step, setStep] = useState(1);
  const [waitingTime, setWaitingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [leadForwardingEmail, setLeadForwardingEmail] = useState('');
  const [leadForwardingPhone, setLeadForwardingPhone] = useState('');
  const [leadForwardingEnabled, setLeadForwardingEnabled] = useState(true);

  // AI Voice Agent State
  const [selectedVoiceId, setSelectedVoiceId] = useState('EXAVITQu4vr4xnSDxMaL');
  const [firstMessage, setFirstMessage] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calendar State
  const [nativeCalendarEnabled, setNativeCalendarEnabled] = useState(true);
  const [bookingUrl, setBookingUrl] = useState('');

  // Initializing state when profile loads
  useEffect(() => {
    if (businessProfile) {
      setBusinessName(businessProfile.businessName || '');
      setContactEmail(businessProfile.contactEmail || user?.email || '');
      setPhoneNumber(businessProfile.phoneNumber || '');
      setLeadForwardingEmail(businessProfile.leadForwardingEmail || user?.email || '');
      setLeadForwardingPhone(businessProfile.leadForwardingPhone || '');
      setLeadForwardingEnabled(businessProfile.leadForwardingEnabled !== false);
      setBookingUrl(businessProfile.bookingLink || '');
      
      setFirstMessage(`Hello, thanks for calling ${businessProfile.businessName || 'us'}! My name is Sarah. How can I help you today?`);
      setSystemPrompt(`You are Sarah, a professional scheduling voice receptionist for ${businessProfile.businessName || 'our business'}. Your goal is to gather caller name, phone number, interest, and schedule them into the calendar.`);
    }
  }, [businessProfile, user]);

  // Stripe success verification and waiting hook
  useEffect(() => {
    if (isProfileLoading || !businessProfile || !user) return;
    
    // Check if the user is authorized for this profile
    if (businessProfile.currentRenterId === user.uid) {
      return; // Authorized!
    }

    // Set up a timer to track how long we've been waiting for Stripe webhook to populate Firestore
    const interval = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isProfileLoading, businessProfile, user]);

  // Audio preview playback toggle
  const togglePlayVoice = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      audioRef.current?.pause();
      setPlayingVoiceId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Since actual previews might be blocked by ElevenLabs API key, we use standard speech synthesis or a friendly alert if preview is missing
      const voice = CONVERSATIONAL_VOICES.find(v => v.voiceId === voiceId);
      if (voice) {
        // Simple speech preview fallback if audio fails
        try {
          const utterance = new SpeechSynthesisUtterance("Hello! This is a preview of my voice for your AI assistant.");
          utterance.onend = () => setPlayingVoiceId(null);
          window.speechSynthesis.speak(utterance);
          setPlayingVoiceId(voiceId);
        } catch (e) {
          console.error("Speech synthesis failed", e);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleNextStep = () => {
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleCompleteOnboarding = async () => {
    if (!user || !firestore || !businessProfileRef) return;
    setIsSubmitting(true);

    try {
      // 1. Provision the ElevenLabs Conversational Voice Agent via local API endpoint
      const provisionPayload = {
        systemPrompt,
        voiceId: selectedVoiceId,
        firstMessage,
        userId: siteId
      };

      const res = await fetch(`/api/elevenlabs/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provisionPayload)
      });

      if (!res.ok) {
        throw new Error('Failed to provision AI Agent on ElevenLabs.');
      }

      const agentData = await res.json();
      const elevenLabsAgentId = agentData.agent_id;

      // 2. Save Business Profile information
      await updateDoc(businessProfileRef, {
        businessName,
        contactEmail,
        phoneNumber,
        leadForwardingEmail,
        leadForwardingPhone,
        leadForwardingEnabled,
        bookingLink: bookingUrl,
        updatedAt: new Date().toISOString()
      });

      // 3. Create/Update calendar settings subcollection
      const calendarSettingsRef = doc(firestore, `businessProfiles/${siteId}/settings/calendar`);
      await setDoc(calendarSettingsRef, {
        workingHours: {
          monday: { start: '09:00', end: '17:00', active: true },
          tuesday: { start: '09:00', end: '17:00', active: true },
          wednesday: { start: '09:00', end: '17:00', active: true },
          thursday: { start: '09:00', end: '17:00', active: true },
          friday: { start: '09:00', end: '17:00', active: true },
          saturday: { start: '09:00', end: '17:00', active: false },
          sunday: { start: '09:00', end: '17:00', active: false },
        },
        slotDurationMinutes: 30,
        timezone: 'America/New_York',
        nativeCalendarEnabled,
        bookingUrl
      }, { merge: true });

      // 4. Save Voice Agent subcollection
      const agentRef = doc(firestore, `businessProfiles/${siteId}/agents/default`);
      await setDoc(agentRef, {
        id: 'default',
        businessProfileId: siteId,
        elevenLabsAgentId,
        voiceId: selectedVoiceId,
        systemPrompt,
        firstMessage,
        name: `${businessName} AI Assistant`,
        status: 'active',
        createdAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Setup Complete!",
        description: "Your digital lead asset and AI Agent have been fully configured.",
      });

      // Redirect Renter to their Dashboard!
      router.push(`/dashboard/${siteId}`);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Setup Error",
        description: error.message || "Failed to configure onboarding details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading States
  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19]">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="mt-4 text-slate-400 text-sm font-medium"><TranslatedText>Loading onboarding details...</TranslatedText></p>
      </div>
    );
  }

  // Waiting for Stripe Webhook to process (with timeout)
  if (businessProfile && businessProfile.currentRenterId !== user?.uid) {
    if (waitingTime > 15) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19] px-4 text-center">
          <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
            <CardHeader>
              <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit mb-2">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-xl font-bold"><TranslatedText>Subscription Verification Timeout</TranslatedText></CardTitle>
              <CardDescription className="text-slate-400">
                <TranslatedText>We are having trouble verifying your active subscription for this site.</TranslatedText>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-slate-350 space-y-4">
              <p>
                <TranslatedText>Stripe might still be processing your payment. If you recently completed payment, click the button below to retry verification.</TranslatedText>
              </p>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button onClick={() => window.location.reload()} className="w-full bg-indigo-600 hover:bg-indigo-500">
                <TranslatedText>Verify Again</TranslatedText>
              </Button>
              <Button variant="ghost" onClick={() => router.push('/marketplace')} className="w-full text-slate-400">
                <TranslatedText>Back to Marketplace</TranslatedText>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19] px-4 text-center">
        <Loader2 className="h-10 w-10 text-indigo-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-white mb-2"><TranslatedText>Verifying Subscription Status...</TranslatedText></h2>
        <p className="text-slate-400 text-sm max-w-sm">
          <TranslatedText>Confirming secure checkout event with Stripe. This takes just a moment...</TranslatedText>
        </p>
        <span className="text-[10px] text-slate-500 mt-2">({waitingTime}s elapsed)</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-100 font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-850 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-1.5 rounded-lg text-white font-black text-sm">T3</span>
          <span className="font-extrabold tracking-tight text-white text-base">T3 Automations</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 bg-slate-900/50 border border-slate-800 px-3.5 py-1.5 rounded-full">
          <Lock className="h-3 w-3 text-indigo-400" />
          <span>Onboarding Site ID: {siteId}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-3xl">
          {/* Progress Indicators */}
          <div className="grid grid-cols-5 gap-3 mb-10 text-center text-xs font-bold">
            {[
              { step: 1, label: "Business" },
              { step: 2, label: "Voice Agent" },
              { step: 3, label: "Lead Alerts" },
              { step: 4, label: "Calendar" },
              { step: 5, label: "Finished" }
            ].map(s => (
              <div 
                key={s.step} 
                className={`py-2 border-b-4 transition-all duration-300 ${
                  step === s.step 
                    ? "border-indigo-500 text-indigo-400" 
                    : step > s.step 
                      ? "border-emerald-500 text-emerald-400" 
                      : "border-slate-800 text-slate-500"
                }`}
              >
                <span className="block md:inline mr-1 text-[10px] bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{s.step}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Wizard Card Body */}
          <Card className="bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-md rounded-2xl overflow-hidden">
            
            {/* STEP 1: BUSINESS PROFILE INFO */}
            {step === 1 && (
              <div className="transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Globe className="h-6 w-6 text-indigo-400" />
                    <TranslatedText>Business Setup</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>Confirm your business details. These details are used to auto-configure your public landing page.</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="biz-name" className="text-slate-300 font-medium">Business Name</Label>
                    <Input 
                      id="biz-name" 
                      placeholder="e.g. Seattle Plumbing Pros" 
                      value={businessName} 
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="biz-email" className="text-slate-300 font-medium">Contact Email</Label>
                      <Input 
                        id="biz-email" 
                        type="email"
                        placeholder="contact@yourbusiness.com" 
                        value={contactEmail} 
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="biz-phone" className="text-slate-300 font-medium">Office Phone Number</Label>
                      <Input 
                        id="biz-phone" 
                        placeholder="(206) 555-0143" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-slate-850 pt-4 bg-slate-950/20">
                  <Button onClick={handleNextStep} disabled={!businessName} className="bg-indigo-600 hover:bg-indigo-500">
                    <TranslatedText>Continue</TranslatedText>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </div>
            )}

            {/* STEP 2: AI VOICE RECEPTIONIST SETUP */}
            {step === 2 && (
              <div className="transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-400" />
                    <TranslatedText>AI Voice Receptionist Configuration</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>Choose a voice and configure your 24/7 conversational dispatcher.</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Voice Grid Selection */}
                  <div className="space-y-2.5">
                    <Label className="text-slate-300 font-medium">Choose a Voice Accent & Style</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {CONVERSATIONAL_VOICES.map(voice => (
                        <div 
                          key={voice.voiceId}
                          onClick={() => setSelectedVoiceId(voice.voiceId)}
                          className={`p-4 border rounded-xl bg-slate-950/50 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                            selectedVoiceId === voice.voiceId 
                              ? "border-indigo-500 ring-2 ring-indigo-500/20" 
                              : "border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-sm">{voice.name}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePlayVoice(voice.voiceId);
                                }}
                                className="h-7 w-7 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                              >
                                {playingVoiceId === voice.voiceId ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{voice.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Greeting & Custom System Prompt */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="biz-greeting" className="text-slate-300 font-medium">AI Custom Greeting Message</Label>
                      <Input 
                        id="biz-greeting" 
                        value={firstMessage} 
                        onChange={(e) => setFirstMessage(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <p className="text-[10px] text-slate-500 leading-normal">
                        <TranslatedText>The greeting message the AI agent will say the exact second a caller dials in.</TranslatedText>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="biz-instructions" className="text-slate-300 font-medium">Instructions & Personality</Label>
                      <Textarea 
                        id="biz-instructions" 
                        rows={4}
                        value={systemPrompt} 
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white text-xs font-mono leading-relaxed"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-850 pt-4 bg-slate-950/20">
                  <Button variant="outline" onClick={handlePrevStep} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                    <TranslatedText>Back</TranslatedText>
                  </Button>
                  <Button onClick={handleNextStep} disabled={!firstMessage || !systemPrompt} className="bg-indigo-600 hover:bg-indigo-500">
                    <TranslatedText>Continue</TranslatedText>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </div>
            )}

            {/* STEP 3: LEAD NOTIFICATION & FORWARDING */}
            {step === 3 && (
              <div className="transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-indigo-400" />
                    <TranslatedText>Lead Forwarding Alerts</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>Configure how you want to be alerted when a new lead is captured by your AI receptionist or landing page.</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between border border-slate-800 p-4 rounded-xl bg-slate-950/30">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">Enable Real-Time Alerts</Label>
                      <p className="text-xs text-slate-400">Receive lead summaries instantly via SMS and Email.</p>
                    </div>
                    <Switch 
                      checked={leadForwardingEnabled} 
                      onCheckedChange={setLeadForwardingEnabled} 
                    />
                  </div>

                  {leadForwardingEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <Label htmlFor="alert-email" className="text-slate-300 font-medium">Forwarding Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input 
                            id="alert-email" 
                            type="email"
                            placeholder="you@email.com" 
                            value={leadForwardingEmail}
                            onChange={(e) => setLeadForwardingEmail(e.target.value)}
                            className="pl-9 bg-slate-800 border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alert-phone" className="text-slate-300 font-medium">Forwarding SMS Mobile Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <Input 
                            id="alert-phone" 
                            placeholder="(206) 555-0199" 
                            value={leadForwardingPhone}
                            onChange={(e) => setLeadForwardingPhone(e.target.value)}
                            className="pl-9 bg-slate-800 border-slate-700 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-850 pt-4 bg-slate-950/20">
                  <Button variant="outline" onClick={handlePrevStep} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                    <TranslatedText>Back</TranslatedText>
                  </Button>
                  <Button onClick={handleNextStep} disabled={leadForwardingEnabled && (!leadForwardingEmail && !leadForwardingPhone)} className="bg-indigo-600 hover:bg-indigo-500">
                    <TranslatedText>Continue</TranslatedText>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </div>
            )}

            {/* STEP 4: CALENDAR SCHEDULING INTEGRATION */}
            {step === 4 && (
              <div className="transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-6 w-6 text-indigo-400" />
                    <TranslatedText>Calendar Scheduling Integration</TranslatedText>
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText>Choose how your AI agent should schedule bookings when speaking with customers.</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between border border-slate-800 p-4 rounded-xl bg-slate-950/30">
                    <div className="space-y-0.5">
                      <Label className="text-base text-white">Use Native T3 Calendar</Label>
                      <p className="text-xs text-slate-400">Allow the AI to write appointments directly to your T3 Calendar dashboard.</p>
                    </div>
                    <Switch 
                      checked={nativeCalendarEnabled} 
                      onCheckedChange={setNativeCalendarEnabled} 
                    />
                  </div>

                  {!nativeCalendarEnabled && (
                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="booking-url" className="text-slate-300 font-medium">External Booking Link (Calendly, Acuity, etc.)</Label>
                      <Input 
                        id="booking-url" 
                        placeholder="https://calendly.com/your-business" 
                        value={bookingUrl}
                        onChange={(e) => setBookingUrl(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                      />
                      <p className="text-[10px] text-slate-500">
                        <TranslatedText>If disabled, your AI Voice Receptionist will automatically text this link to callers requesting an appointment booking.</TranslatedText>
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-850 pt-4 bg-slate-950/20">
                  <Button variant="outline" onClick={handlePrevStep} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                    <TranslatedText>Back</TranslatedText>
                  </Button>
                  <Button onClick={handleNextStep} disabled={!nativeCalendarEnabled && !bookingUrl} className="bg-indigo-600 hover:bg-indigo-500">
                    <TranslatedText>Continue</TranslatedText>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </div>
            )}

            {/* STEP 5: SETUP COMPLETE */}
            {step === 5 && (
              <div className="transition-all duration-500">
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-emerald-500/10 p-3 rounded-full w-fit mb-3">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </div>
                  <CardTitle className="text-3xl font-extrabold text-white tracking-tight">
                    <TranslatedText>Ready to Launch!</TranslatedText>
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    <TranslatedText>Review your settings. We are ready to build, launch, and deploy your voice receptionist.</TranslatedText>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-300 max-w-md mx-auto">
                  <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/50 border border-slate-850">
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500 font-semibold"><TranslatedText>Business Name</TranslatedText></span>
                      <span className="text-white font-bold">{businessName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500 font-semibold"><TranslatedText>AI Voice Name</TranslatedText></span>
                      <span className="text-white font-bold">
                        {CONVERSATIONAL_VOICES.find(v => v.voiceId === selectedVoiceId)?.name.split(" ")[0] || "Sarah"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500 font-semibold"><TranslatedText>Lead Forwarding</TranslatedText></span>
                      <span className="text-white font-bold">
                        {leadForwardingEnabled ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold"><TranslatedText>Calendar Engine</TranslatedText></span>
                      <span className="text-white font-bold">
                        {nativeCalendarEnabled ? "T3 Native Calendar" : "External Calendly Link"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t border-slate-850 pt-4 bg-slate-950/20">
                  <Button variant="outline" onClick={handlePrevStep} disabled={isSubmitting} className="border-slate-800 text-slate-300 hover:bg-slate-800">
                    <TranslatedText>Back</TranslatedText>
                  </Button>
                  <Button onClick={handleCompleteOnboarding} disabled={isSubmitting} className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold shadow-lg shadow-indigo-600/20">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <TranslatedText>Deploying Agent...</TranslatedText>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4" />
                        <TranslatedText>Deploy & Start Generating Leads</TranslatedText>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </div>
            )}

          </Card>
        </div>
      </main>
    </div>
  );
}
