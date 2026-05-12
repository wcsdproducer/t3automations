'use client';
import { Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PhoneNumbersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Phone Numbers</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage the phone numbers connected to your AI voice agents.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Your Numbers
          </CardTitle>
          <CardDescription>
            Phone numbers are provisioned through Twilio and linked to your agents.
            Numbers assigned to an agent appear on that agent's settings page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No standalone phone numbers yet. Create an agent and assign a Twilio number from the agent settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
