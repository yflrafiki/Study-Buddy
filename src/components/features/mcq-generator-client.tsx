'use client';

import { useState } from 'react';
import { generateMCQs, type MCQGeneratorOutput } from '@/ai/flows/mcq-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MCQGeneratorClient() {
  const [file, setFile] = useState<File | null>(null);
  const [mcqs, setMcqs] = useState<MCQGeneratorOutput['questions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
       if (selectedFile.type !== 'application/pdf') {
        toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
        return;
      }
      setFile(selectedFile);
      setMcqs(null);
      setSelectedAnswers({});
      setShowAnswers({});
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'No file selected', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setMcqs(null);
    setSelectedAnswers({});
    setShowAnswers({});

    try {
      const pdfDataUri = await fileToDataUri(file);
      const result = await generateMCQs({ pdfDataUri, numberOfQuestions: 5 });
      setMcqs(result.questions);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error generating MCQs', description: 'An error occurred while generating questions. The AI may be unavailable or the PDF could not be processed.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAnswer = (index: number) => {
    setShowAnswers(prev => ({...prev, [index]: !prev[index]}));
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
          <CardDescription>Select a PDF document to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-lg items-center gap-2">
              <Label htmlFor="pdf-upload">PDF File</Label>
              <div className="flex gap-2">
                <Input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
                <Button type="submit" disabled={isLoading || !file}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                  Generate
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col justify-center items-center p-8 text-center rounded-lg border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Generating Questions</p>
            <p className="text-muted-foreground">The AI is analyzing your document. This might take a moment.</p>
        </div>
      )}

      {mcqs && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold font-headline">Generated Questions</h2>
          {mcqs.map((mcq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Question {index + 1}</CardTitle>
                <p className='text-card-foreground pt-2'>{mcq.question}</p>
              </CardHeader>
              <CardContent>
                <RadioGroup onValueChange={(value) => setSelectedAnswers(prev => ({...prev, [index]: value}))}>
                  {mcq.options.map((option, i) => {
                    const isCorrect = option === mcq.answer;
                    const isSelected = selectedAnswers[index] === option;
                    const isRevealed = showAnswers[index];
                    return (
                        <div key={i} className={cn("flex items-center space-x-3 p-3 rounded-md border transition-all",
                            isRevealed && isCorrect && "bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-700",
                            isRevealed && !isCorrect && isSelected && "bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-700"
                        )}>
                            <RadioGroupItem value={option} id={`q${index}-o${i}`} disabled={isRevealed}/>
                            <Label htmlFor={`q${index}-o${i}`} className="flex-1 cursor-pointer">{option}</Label>
                            {isRevealed && isCorrect && <Check className="h-5 w-5 text-green-600" />}
                            {isRevealed && !isCorrect && isSelected && <X className="h-5 w-5 text-red-600" />}
                        </div>
                    )
                  })}
                </RadioGroup>
                <div className="mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleShowAnswer(index)}>
                        {showAnswers[index] ? "Hide Answers" : "Check Answers"}
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
