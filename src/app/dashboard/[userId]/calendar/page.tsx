'use client';

import React, { useEffect, useState } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, setDoc, collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, Clock, ExternalLink, Link as LinkIcon, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarSettings, WorkingHours, DayOfWeek, Appointment } from '@/types/calendar';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const defaultWorkingHours: WorkingHours = {
  monday: { start: '09:00', end: '17:00', active: true },
  tuesday: { start: '09:00', end: '17:00', active: true },
  wednesday: { start: '09:00', end: '17:00', active: true },
  thursday: { start: '09:00', end: '17:00', active: true },
  friday: { start: '09:00', end: '17:00', active: true },
  saturday: { start: '09:00', end: '17:00', active: false },
  sunday: { start: '09:00', end: '17:00', active: false },
};

const defaultSettings: CalendarSettings = {
  workingHours: defaultWorkingHours,
  slotDurationMinutes: 30,
  timezone: 'America/New_York',
  nativeCalendarEnabled: true,
  bookingUrl: ''
};

export default function CalendarPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [settings, setSettings] = useState<CalendarSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

  const userIdSlug = user?.uid.slice(-12);

  // Firestore Refs
  const businessProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, `businessProfiles/${user.uid}`);
  }, [user, firestore]);

  const settingsRef = useMemoFirebase(() => {
    if (!businessProfileRef) return null;
    return doc(businessProfileRef, 'settings/calendar');
  }, [businessProfileRef]);

  const appointmentsRef = useMemoFirebase(() => {
    if (!businessProfileRef) return null;
    return query(collection(businessProfileRef, 'appointments'), orderBy('date', 'desc'), orderBy('time', 'desc'));
  }, [businessProfileRef]);

  // Data Fetching
  const { data: businessProfile } = useDoc<{ bookingUrl?: string }>(businessProfileRef);
  const { data: settingsData, isLoading: isLoadingSettings } = useDoc<CalendarSettings>(settingsRef);
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useCollection(appointmentsRef);

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    } else if (businessProfile?.bookingUrl) {
      // Legacy migration logic
      setSettings(prev => ({
        ...prev,
        bookingUrl: businessProfile.bookingUrl,
        nativeCalendarEnabled: false
      }));
    }
  }, [settingsData, businessProfile]);

  const handleSaveSettings = async () => {
    if (!settingsRef) return;
    setIsSaving(true);
    try {
      await setDoc(settingsRef, settings, { merge: true });
      toast({ title: 'Success', description: 'Calendar settings saved successfully.' });
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    }
    setIsSaving(false);
  };

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], active: checked }
      }
    }));
  };

  const handleTimeChange = (day: DayOfWeek, type: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], [type]: value }
      }
    }));
  };

  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  if (isLoadingSettings || isLoadingAppointments) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading calendar data...</p>
      </div>
    );
  }

  const appointments = (appointmentsData || []) as Appointment[];

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-primary" />
          Calendar & Scheduling
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col min-h-0">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col">
          <Card className="flex-1 flex flex-col min-h-0">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Appointments booked autonomously by your AI agent.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-6">
                {appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">No appointments scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-6">
                    {appointments.map(apt => (
                      <div key={apt.id} className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{apt.name}</span>
                            <Badge variant={apt.status === 'scheduled' ? 'default' : 'secondary'}>{apt.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.phone} {apt.email ? `• ${apt.email}` : ''}</p>
                          <p className="text-sm mt-2">{apt.service}</p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-1 bg-muted/50 p-3 rounded-md min-w-[150px]">
                          <div className="flex items-center gap-2 font-medium">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            {apt.date}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Clock className="h-4 w-4" />
                            {apt.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Engine</CardTitle>
                <CardDescription>Choose how you want your AI Agent to handle bookings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Use Native T3 Calendar</Label>
                    <p className="text-sm text-muted-foreground">Allow the AI to check your availability and book directly into T3.</p>
                  </div>
                  <Switch 
                    checked={settings.nativeCalendarEnabled} 
                    onCheckedChange={(c) => setSettings(prev => ({ ...prev, nativeCalendarEnabled: c }))} 
                  />
                </div>

                {!settings.nativeCalendarEnabled && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>External Booking URL (Calendly, Acuity, etc)</Label>
                    <div className="flex relative">
                      <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="https://calendly.com/your-name" 
                        className="pl-9" 
                        value={settings.bookingUrl || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, bookingUrl: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">The AI will text this link to callers when they ask to book an appointment.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardFooter>
            </Card>

            {settings.nativeCalendarEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>Set your standard working hours for AI bookings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label>Timezone</Label>
                      <Select 
                        value={settings.timezone}
                        onValueChange={(val) => setSettings(prev => ({ ...prev, timezone: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIMEZONES.map(tz => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Slot Duration (minutes)</Label>
                      <Select 
                        value={settings.slotDurationMinutes.toString()}
                        onValueChange={(val) => setSettings(prev => ({ ...prev, slotDurationMinutes: parseInt(val) || 30 }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 15, 30, 60, 120].map(duration => (
                            <SelectItem key={duration} value={duration.toString()}>{duration}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Weekly Hours</Label>
                    {days.map(day => (
                      <div key={day} className="flex items-center gap-4 py-2 border-b last:border-0">
                        <div className="w-28 flex items-center gap-2">
                          <Switch 
                            checked={settings.workingHours[day].active}
                            onCheckedChange={(c) => handleDayToggle(day, c)}
                          />
                          <span className="capitalize text-sm font-medium">{day.slice(0, 3)}</span>
                        </div>
                        {settings.workingHours[day].active ? (
                          <div className="flex flex-1 items-center gap-2">
                            <Input 
                              type="time" 
                              className="h-8 text-xs" 
                              value={settings.workingHours[day].start}
                              onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                            />
                            <span className="text-muted-foreground text-xs">to</span>
                            <Input 
                              type="time" 
                              className="h-8 text-xs" 
                              value={settings.workingHours[day].end}
                              onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className="flex-1 text-xs text-muted-foreground px-2">Closed</div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
