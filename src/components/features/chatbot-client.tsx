'use client';

import { useState, useEffect } from 'react';
import { aiChatbot } from '@/ai/flows/ai-chatbot';
import { answerQuestions } from '@/ai/flows/answer-questions';
import { Button } from '@/components/ui/button';
// import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Bot, User, Paperclip, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

export function ChatbotClient() {
  // const [context, setContext] = useState('');
  const [query, setQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  // const [activeTab, setActiveTab] = useState('text');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

   useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Failed to parse chat history from localStorage', error);
      // If parsing fails, we can clear it to prevent further errors
      localStorage.removeItem('chatHistory');
    }
  }, []);

  useEffect(() => {
    // We only want to save if there's something to save, and it's not the initial empty array
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } else if (messages.length === 0) {
        localStorage.removeItem('chatHistory');
    }
  }, [messages]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
        return;
      }
      setFile(selectedFile);
    }
  };

   const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
    setFile(null);
    toast({
      title: 'Chat Cleared',
      description: 'Your conversation and uploaded file have been removed.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: 'Missing question',
        description: 'Please provide a question.',
        variant: 'destructive',
      });
      return;
    }

    // if (!file) {
    //   toast({
    //     title: 'Missing document',
    //     description: 'Please upload a PDF document to ask questions about.',
    //     variant: 'destructive',
    //   });
    //   return;
    // }

    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    
    try {
      let result;
       if (file) {
        const documentDataUri = await fileToDataUri(file);
        result = await answerQuestions({ documentDataUri, query });
      } else {
        const historyContext = messages.slice(0, -1).map(m => `${m.role}: ${m.content}`).join('\n');
        result = await aiChatbot({ query, context: historyContext });
      }
      const botMessage: Message = { role: 'bot', content: result.answer };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: 'Error getting answer',
        description: 'An error occurred while communicating with the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setQuery('');
      setIsLoading(false);
    }
  };
  
  const isSubmitDisabled = isLoading || !query.trim();

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-1">
        <CardHeader>
         <CardTitle>Context</CardTitle>
          <CardDescription>Optionally upload a PDF for context.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 border-dashed border-2 rounded-lg flex flex-col items-center justify-center p-4 text-center">
              <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden"/>
              <Label htmlFor="pdf-upload" className={cn("cursor-pointer flex flex-col items-center justify-center gap-2", file && "text-green-600")}>
                  <Paperclip className="h-8 w-8 text-muted-foreground" />
                  {file ? 
                      <span>{file.name}</span> : 
                      <span className="text-muted-foreground">Click to upload PDF</span>
                  }
              </Label>
            </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 flex flex-col">
         <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Chat</CardTitle>
                <CardDescription>{file ? 'Ask about the document or anything else.' : 'Ask me anything.'}</CardDescription>
            </div>
             {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearHistory} aria-label="Clear chat history">
                    <Trash2 className="h-4 w-4" />
                    Clear 
                </Button>
            )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 h-[400px] border rounded-md p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                  Your conversation will appear here.
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'bot' && (
                    <div className="p-2 bg-primary rounded-full text-primary-foreground">
                      <Bot size={18} />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                     <div className="p-2 bg-muted rounded-full text-foreground">
                      <User size={18} />
                    </div>
                  )}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-start gap-3">
                     <div className="p-2 bg-primary rounded-full text-primary-foreground">
                      <Bot size={18} />
                    </div>
                    <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question..."
              aria-label="Chat Input"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isSubmitDisabled}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
