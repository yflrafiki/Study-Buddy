import { CalendarClient } from '@/components/features/calendar-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar Integration - ScholarAI',
  description: 'Connect your Google Calendar to plan study sessions and get reminders.',
};

export default function CalendarPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Calendar Integration</h1>
        <p className="text-muted-foreground">Connect your Google Calendar to sync your study schedule.</p>
      </header>
      <CalendarClient />
    </div>
  );
}
