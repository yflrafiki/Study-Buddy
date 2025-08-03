import { ProgressTracker } from '@/components/features/progress-tracker';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, FileQuestion, BookOpen, Mic, ImagePlay, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const tools = [
  { href: '/mcq-generator', label: 'MCQ Generator', icon: FileQuestion, description: "Generate quizzes from your PDFs." },
  { href: '/chatbot', label: 'AI Chatbot', icon: Bot, description: "Ask questions about documents or general topics." },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen, description: "Create flashcards from notes or PDFs." },
  { href: '/transcription', label: 'Note Taker', icon: Mic, description: "Transcribe your lectures in real-time." },
  { href: '/image-animator', label: 'Image Animator', icon: ImagePlay, description: "Animate images for visual aids." },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays, description: "Connect your Google Calendar." },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ScholarAI! Here are your tools to get started.</p>
        <p className="text-muted-foreground">Let's get those grades up</p>
      </header>
      
      <main className="flex-grow">
        <section className='mb-8'>
          <h2 className="text-2xl font-semibold font-headline mb-4">Your Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(tool => (
              <Card key={tool.href} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <tool.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{tool.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-2">
                  <p className="text-muted-foreground">{tool.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={tool.href}>Open Tool</Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <ProgressTracker />
        </section>
      </main>
    </div>
  );
}
