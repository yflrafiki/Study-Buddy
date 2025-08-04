import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, FileQuestion, BookOpen, ImagePlay, BookText } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const tools = [
 { href: '/mcq-generator', label: 'Interactive Quiz', icon: FileQuestion, description: "Create a quiz from a PDF to test your knowledge." },
  { href: '/chatbot', label: 'AI Chatbot', icon: Bot, description: "Chat with an AI about documents or general topics." },
  { href: '/flashcards', label: 'Flashcards', icon: BookOpen, description: "Generate flashcards from your notes or PDFs." },
  { href: '/image-animator', label: 'Image Animator', icon: ImagePlay, description: "Turn static images into simple animated visuals." },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 p-4 sm:p-6 md:p-8 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ScholarAI! Select a tool to get started</p>
        <p className="text-muted-foreground">Let's get those grades up</p>
      </header>
      
      <main className="flex-grow">
        <Card>
          <CardHeader>
            <CardTitle>Your Tools</CardTitle>
            <CardDescription>Your AI-powered study companion tools.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {tools.map((tool, index) => (
                <Link href={tool.href} key={tool.href}>
                  <div className={`flex items-center p-4 hover:bg-muted/50 transition-colors duration-200 cursor-pointer ${index < tools.length - 1 ? 'border-b' : ''}`}>
                    <div className="p-2 bg-primary/10 rounded-lg mr-4">
                      <tool.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold">{tool.label}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-4" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
