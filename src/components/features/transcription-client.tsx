'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Square, Play, Trash2, AlertTriangle, FileUp, Loader2, Paperclip, BookText, List } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { transcribeAndSummarizeAudio } from '@/ai/flows/transcribe-and-summarize';

let recognition: SpeechRecognition | null = null;

interface AudioResult {
  transcription: string;
  summary: string;
}

export function TranscriptionClient() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

   const [activeTab, setActiveTab] = useState('live');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscription(prev => prev + finalTranscript + (finalTranscript ? ' ' : '') + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        let description = `An error occurred: ${event.error}`;
        if (event.error === 'network') {
          description = 'A network error occurred. Please check your internet connection and try again.';
        } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          description = 'Microphone access was denied. Please allow microphone access in your browser settings.';
        } else if (event.error === 'no-speech') {
          description = 'No speech was detected. Please try again.';
        }
        toast({ title: 'Recognition Error', description, variant: 'destructive' });
        setIsRecording(false);
      };

    } else {
      setIsSupported(false);
    }
  }, [toast]);

  const handleToggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setTranscription(''); // Clear previous transcription
      try {
        recognition.start();
      } catch (e) {
        // This can happen if start() is called while already active, which we prevent with isRecording.
        // It can also happen in some browser states.
        console.error("Failed to start recognition", e);
        toast({ title: 'Could not start recording', description: 'There was an issue starting the speech recognition service.', variant: 'destructive' });
        setIsRecording(false);
        return;
      }
    }
    setIsRecording(!isRecording);
  };

  const handlePlayback = () => {
   const textToPlay = audioResult ? audioResult.transcription : transcription;
    if (!textToPlay.trim()) {
      toast({ title: 'Nothing to play', description: 'There is no transcribed text to play back.', variant: 'destructive' });
      return;
    }
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setTranscription('');
    setAudioResult(null);
     setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (!selectedFile.type.startsWith('audio/')) {
            toast({ title: 'Invalid file type', description: 'Please upload an audio file.', variant: 'destructive' });
            return;
        }
        setFile(selectedFile);
        setAudioResult(null);
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

  const handleFileUpload = async () => {
    if (!file) {
        toast({ title: 'No file selected', description: 'Please choose an audio file to upload.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    setAudioResult(null);
    try {
        const audioDataUri = await fileToDataUri(file);
        const result = await transcribeAndSummarizeAudio({ audioDataUri });
        setAudioResult(result);
    } catch (error) {
        console.error('Error processing audio file:', error);
        toast({ title: 'Processing Error', description: 'Failed to transcribe and summarize the audio. The file might be unsupported or an AI error occurred.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader className='flex-row items-center gap-4'>
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                    <CardTitle className='text-destructive'>Browser Not Supported</CardTitle>
                    <CardDescription className='text-destructive/80'>
                       Your browser does not support the Web Speech API for live transcription. You can still use the audio upload feature.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Note Taker</CardTitle>
        <CardDescription>Use live transcription or upload an audio file to get notes and a summary.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live" disabled={!isSupported}>
              <Mic className="mr-2 h-4 w-4" />
              Live Transcription
            </TabsTrigger>
            <TabsTrigger value="upload">
              <FileUp className="mr-2 h-4 w-4" />
              Upload Audio
            </TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleToggleRecording} size="lg" className={isRecording ? 'bg-destructive hover:bg-destructive/90' : ''}>
                  {isRecording ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <Button onClick={handlePlayback} variant="outline" disabled={isRecording || !transcription.trim()}>
                  <Play className="mr-2 h-4 w-4" />
                  Playback
                </Button>
                <Button onClick={handleClear} variant="ghost" disabled={isRecording || !transcription.trim()}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
              <ScrollArea className="h-72 w-full rounded-md border p-4">
                <p className="whitespace-pre-wrap">
                  {transcription || <span className="text-muted-foreground">Your transcribed text will appear here...</span>}
                </p>
              </ScrollArea>
            </div>
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
             <div className="space-y-4">
                <div className="min-h-[200px] border-dashed border-2 rounded-lg flex flex-col items-center justify-center p-4 text-center">
                  <Input id="audio-upload" type="file" accept="audio/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                  <Label htmlFor="audio-upload" className={cn("cursor-pointer flex flex-col items-center justify-center gap-2", file && "text-green-600")}>
                      <Paperclip className="h-8 w-8 text-muted-foreground" />
                      {file ? 
                          <span>{file.name}</span> : 
                          <span className="text-muted-foreground">Click to upload an audio file</span>
                      }
                  </Label>
                </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={handleFileUpload} disabled={isLoading || !file}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Processing...' : 'Transcribe & Summarize'}
                    </Button>
                    <Button onClick={handleClear} variant="ghost" disabled={isLoading || (!file && !audioResult)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                </div>
                {isLoading && (
                  <div className="flex flex-col justify-center items-center p-8 text-center rounded-lg border border-dashed">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-lg font-medium">Processing Audio</p>
                      <p className="text-muted-foreground">The AI is working its magic. This may take a few moments for longer files.</p>
                  </div>
                )}
                {audioResult && (
                  <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold flex items-center gap-2"><BookText className="w-5 h-5 text-primary" /> Transcription</h3>
                        <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/50">
                            <p className="whitespace-pre-wrap">{audioResult.transcription}</p>
                        </ScrollArea>
                    </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-semibold flex items-center gap-2"><List className="w-5 h-5 text-primary" /> Summary</h3>
                        <div className="rounded-md border p-4 prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2">
                           <p className="whitespace-pre-wrap">{audioResult.summary}</p>
                        </div>
                    </div>
                  </div>
                )}
             </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
