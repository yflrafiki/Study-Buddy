'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { cartoonifyImage } from '@/ai/flows/cartoonify-image';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';

const animations = [
  { value: 'animate-none', label: 'None' },
  { value: 'animate-pulse', label: 'Pulse' },
  { value: 'animate-bounce', label: 'Bounce' },
  { value: 'animate-spin', label: 'Spin' },
  { value: 'animate-ping-slow', label: 'Ping' },
  { value: 'animate-zoom-in-out', label: 'Zoom' },
];

export function ImageAnimatorClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cartoonSrc, setCartoonSrc] = useState<string | null>(null);
  const [isCartoonifying, setIsCartoonifying] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate-none');
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        setImageSrc(result);
        setCartoonSrc(null); // Reset cartoon on new image
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCartoonify = async () => {
    if (!imageSrc) {
      toast({
        title: 'No Image',
        description: 'Please upload an image first.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCartoonifying(true);
    setCartoonSrc(null);

    try {
      const result = await cartoonifyImage({ imageDataUri: imageSrc });
      setCartoonSrc(result.cartoonDataUri);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Cartoonification Failed',
        description: 'Could not generate a cartoon version of the image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCartoonifying(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <style jsx>{`
        @keyframes zoom-in-out {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-zoom-in-out {
          animation: zoom-in-out 3s infinite ease-in-out;
        }
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Upload an image and apply effects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div>
            <Label htmlFor="animation-select">Animation</Label>
            <Select onValueChange={setAnimationClass} defaultValue={animationClass}>
              <SelectTrigger id="animation-select">
                <SelectValue placeholder="Select animation" />
              </SelectTrigger>
              <SelectContent>
                {animations.map((anim) => (
                  <SelectItem key={anim.value} value={anim.value}>
                    {anim.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <Button onClick={handleCartoonify} disabled={!imageSrc || isCartoonifying} className="w-full">
            {isCartoonifying ? <Loader2 className="animate-spin" /> : <Wand2 />}
            <span>{isCartoonifying ? 'Creating Cartoon...' : 'Cartoonify Image'}</span>
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>The original image and its AI-generated cartoon version.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <h3 className="text-lg font-medium text-center mb-2">Original</h3>
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center overflow-hidden p-2">
                  {imageSrc ? (
                    <div className={animationClass}>
                      <Image
                        src={imageSrc}
                        alt="Uploaded preview"
                        width={300}
                        height={300}
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">Your image will appear here</p>
                  )}
                </div>
             </div>
             <div>
                <h3 className="text-lg font-medium text-center mb-2">Cartoon</h3>
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center overflow-hidden p-2">
                  {isCartoonifying && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                  {!isCartoonifying && cartoonSrc ? (
                    <div className={animationClass}>
                      <Image
                        src={cartoonSrc}
                        alt="Cartoon version"
                        width={300}
                        height={300}
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  ) : (
                    !isCartoonifying && <p className="text-muted-foreground text-center">AI-generated cartoon will appear here</p>
                  )}
                </div>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
