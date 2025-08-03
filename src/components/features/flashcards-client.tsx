'use client';

import { useState } from 'react';
import { generateFlashcards, type GenerateFlashcardsOutput } from '@/ai/flows/flashcard-generator';
import { generateFlashcardsFromDocument } from '@/ai/flows/generate-flashcards';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Paperclip, Download } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface Flashcard {
  term: string;
  definition: string;
}

const FlippableCard = ({ card }: { card: Flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full h-full perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        <div className="absolute w-full h-full backface-hidden">
          <Card className="h-full flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <p className="text-xl font-semibold">{card.term}</p>
            </CardContent>
          </Card>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <Card className="h-full flex items-center justify-center bg-secondary">
            <CardContent className="p-6">
              <p>{card.definition}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
};


export function FlashcardsClient() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('text');
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGeneration = async () => {
    setIsLoading(true);
    setFlashcards(null);

    try {
      let result;
      if (activeTab === 'text') {
        if (!text.trim()) {
          toast({ title: 'Text is empty', description: 'Please enter some text to generate flashcards.', variant: 'destructive' });
          return;
        }
        result = await generateFlashcards({ text });
      } else { // document
        if (!file) {
          toast({ title: 'No file selected', description: 'Please upload a PDF file.', variant: 'destructive' });
          return;
        }
        const pdfDataUri = await fileToDataUri(file);
        result = await generateFlashcardsFromDocument({ pdfDataUri });
      }
      setFlashcards(result.flashcards);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error generating flashcards', description: 'An error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!flashcards || flashcards.length === 0) {
      toast({
        title: 'No flashcards to download',
        description: 'Please generate some flashcards first.',
        variant: 'destructive',
      });
      return;
    }

    const fileContent = flashcards
      .map((card) => `Term: ${card.term}\nDefinition: ${card.definition}\n\n`)
      .join('');
    
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flashcards.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: 'Download Started',
        description: 'Your flashcards are being downloaded as flashcards.txt.'
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Flashcards</CardTitle>
          <CardDescription>Generate from text or a PDF document.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">From Text</TabsTrigger>
              <TabsTrigger value="document">From Document</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your notes, an article, or any text here..."
                className="min-h-[200px]"
              />
            </TabsContent>
            <TabsContent value="document" className="mt-4">
              <div className="min-h-[200px] border-dashed border-2 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden"/>
                <Label htmlFor="pdf-upload" className={cn("cursor-pointer flex flex-col items-center justify-center gap-2", file && "text-green-600")}>
                    <Paperclip className="h-8 w-8 text-muted-foreground" />
                    {file ? 
                        <span>{file.name}</span> : 
                        <span className="text-muted-foreground">Click to upload PDF</span>
                    }
                </Label>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4">
            <Button onClick={handleGeneration} disabled={isLoading || (activeTab === 'text' && !text.trim()) || (activeTab === 'document' && !file)}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Generate Flashcards
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
         <div className="flex flex-col justify-center items-center p-8 text-center rounded-lg border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Creating Flashcards</p>
            <p className="text-muted-foreground">The AI is crafting your study set. Please wait.</p>
        </div>
      )}

      {flashcards && flashcards.length > 0 && (
        <div>
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold font-headline">Your Flashcards</h2>
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          <Carousel className="w-full max-w-xl mx-auto" opts={{ loop: true }}>
            <CarouselContent>
              {flashcards.map((card, index) => (
                <CarouselItem key={index}>
                  <div className="p-1 h-[250px]">
                    <FlippableCard card={card} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
           <p className="text-center text-muted-foreground mt-4">Click on a card to flip it.</p>
        </div>
      )}
    </div>
  );
}
