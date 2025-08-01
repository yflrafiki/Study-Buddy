'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';

const mockEvents = [
  { title: 'Chemistry Study Session', time: 'Today, 4:00 PM - 5:30 PM', color: 'bg-blue-500' },
  { title: 'History Midterm', time: 'Tomorrow, 10:00 AM', color: 'bg-red-500' },
  { title: 'Group Project Meeting', time: 'Friday, 2:00 PM', color: 'bg-green-500' },
];

export function CalendarClient() {
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
      title: 'Feature in development',
      description: 'Google Calendar integration is not yet implemented.',
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Connect Your Account</CardTitle>
          <CardDescription>
            Allow Study Buddy to access your Google Calendar to create study events and set reminders.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
           <Image src="https://placehold.co/100x100.png" width={80} height={80} alt="Google Calendar Logo" data-ai-hint="google calendar" className="rounded-lg" />
           <div className="flex-grow">
            <h3 className="font-semibold">Google Calendar</h3>
            <p className="text-sm text-muted-foreground">Sync your study schedule, create events, and get notified about upcoming deadlines and exams directly from Study Buddy.</p>
           </div>
          <Button onClick={handleConnect}>Connect to Google Calendar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>This is a preview of how your events would appear.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEvents.map((event, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <div className={`w-2 h-12 rounded-full ${event.color}`} />
                <div className="flex-grow">
                  <p className="font-semibold">{event.title}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span>{event.time}</span>
                  </div>
                </div>
                <CheckCircle className="text-green-500" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
