'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Square, Play, Trash2, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

let recognition: SpeechRecognition | null = null;

export function TranscriptionClient() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const { toast } = useToast();

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
        toast({ title: 'Recognition Error', description: `An error occurred: ${event.error}`, variant: 'destructive' });
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
      recognition.start();
    }
    setIsRecording(!isRecording);
  };

  const handlePlayback = () => {
    if (!transcription.trim()) {
      toast({ title: 'Nothing to play', description: 'There is no transcribed text to play back.', variant: 'destructive' });
      return;
    }
    const utterance = new SpeechSynthesisUtterance(transcription);
    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setTranscription('');
  };

  if (!isSupported) {
    return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader className='flex-row items-center gap-4'>
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                    <CardTitle className='text-destructive'>Browser Not Supported</CardTitle>
                    <CardDescription className='text-destructive/80'>
                        Your browser does not support the Web Speech API. Please try Chrome or another supported browser.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Transcription</CardTitle>
        <CardDescription>Click the microphone to start or stop recording.</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
