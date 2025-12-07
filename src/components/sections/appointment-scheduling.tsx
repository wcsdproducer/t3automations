'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function AppointmentScheduling() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [time, setTime] = React.useState<string | undefined>(undefined);
  const { toast } = useToast();

  React.useEffect(() => {
    // Set initial date on client to avoid hydration mismatch
    setDate(new Date());
  }, []);

  const handleBooking = () => {
    if (date && time) {
      toast({
        title: 'Appointment Booked!',
        description: `Your appointment is scheduled for ${date.toLocaleDateString()} at ${time}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Please select a date and time.',
      });
    }
  };

  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle>Appointment Scheduling</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 flex-grow">
        <p className="text-center text-muted-foreground">
          Automate the scheduling process. Our AI integrates with your calendars and allows callers to book appointments directly.
        </p>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
        />
        <div className="w-full">
            <Select onValueChange={setTime} value={time}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="09:00 AM - 09:30 AM">09:00 AM - 09:30 AM</SelectItem>
                    <SelectItem value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</SelectItem>
                    <SelectItem value="11:00 AM - 11:30 AM">11:00 AM - 11:30 AM</SelectItem>
                    <SelectItem value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</SelectItem>
                    <SelectItem value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Button onClick={handleBooking} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          Book Appointment
        </Button>
      </CardContent>
    </Card>
  );
}
