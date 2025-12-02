
import React, { useState, useEffect, useRef } from 'react';
import { generateVeoVideo, generateImage } from '../services/gemini';
import { Video, Loader2, PlayCircle, KeyRound, Images, Film } from 'lucide-react';

const VideoGenerator: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [flipbookFrames, setFlipbookFrames] = useState<string[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'NONE' | 'VEO' | 'FLIPBOOK'>('NONE');
  const [hasKey, setHasKey] = useState(false);

  // Animation Loop for Flipbook
  useEffect(() => {
    let interval: any;
    if (mode === 'FLIPBOOK' && flipbookFrames.length > 0) {
        interval = setInterval(() => {
            setCurrentFrameIndex(prev => (prev + 1) % flipbookFrames.length);
        }, 500); // 500ms per frame
    }
    return () => clearInterval(interval);
  }, [mode, flipbookFrames]);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
        const has = await aistudio.hasSelectedApiKey();
        setHasKey(has);
    }
  };

  const selectKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
          await aistudio.openSelectKey();
          setHasKey(true); // Optimistic update
      }
  };

  const handleGenerateVeo = async () => {
    if (!hasKey) {
        await selectKey();
        return;
    }
    
    setLoading(true);
    setVideoUrl(null);
    setFlipbookFrames([]);
    setMode('VEO');

    try {
      const url = await generateVeoVideo("Lily the Cat Explorer waving hello in a colorful forest background. Cartoon style, cute movement, vibrant colors.", "16:9");
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
      alert("Video creation failed. Make sure you selected a paid project key!");
      setMode('NONE');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlipbook = async () => {
      setLoading(true);
      setVideoUrl(null);
      setFlipbookFrames([]);
      setMode('FLIPBOOK');

      const basePrompt = "Cartoon illustration of Lily the Cat Explorer in a colorful forest background, simple flat vector art, children book style, white border";
      
      const prompts = [
          `${basePrompt}, standing still smiling`,
          `${basePrompt}, raising right hand to wave hello`,
          `${basePrompt}, waving hand high in the air`
      ];

      try {
          // Generate 3 frames
          const results = await Promise.all(prompts.map(p => generateImage(p)));
          setFlipbookFrames(results);
      } catch (e) {
          console.error(e);
          alert("Could not make the flipbook right now.");
          setMode('NONE');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-3xl font-bold text-red-500 mb-2">Movie Maker</h2>
      <p className="text-gray-500 mb-6 text-center text-sm max-w-sm">Create a magical intro for Lily!</p>

      {/* Screen Area */}
      <div className="w-full max-w-lg aspect-video bg-black rounded-2xl overflow-hidden shadow-xl mb-8 flex items-center justify-center relative border-4 border-gray-800">
        
        {loading && (
            <div className="absolute inset-0 z-20 bg-black/80 flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin w-12 h-12 mb-4 text-red-500" />
                <p>Lights, Camera, Action!</p>
            </div>
        )}

        {mode === 'VEO' && videoUrl && (
            <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
        )}

        {mode === 'FLIPBOOK' && flipbookFrames.length > 0 && (
            <img 
                src={flipbookFrames[currentFrameIndex]} 
                alt="Animation Frame" 
                className="w-full h-full object-cover animate-fade-in"
            />
        )}

        {mode === 'NONE' && !loading && (
            <div className="text-gray-600 flex flex-col items-center opacity-50">
                <Film size={64} className="mb-2" />
                <p>No movie playing</p>
            </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          
          {/* Option 1: Flipbook (Free) */}
          <button
            onClick={handleGenerateFlipbook}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-2 bg-yellow-100 text-yellow-700 p-6 rounded-2xl font-bold hover:bg-yellow-200 transition-transform active:scale-95 border-2 border-yellow-300"
          >
            <Images size={32} />
            <span>Magic Flipbook</span>
            <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full">Free • Fast</span>
          </button>

          {/* Option 2: Veo (Paid) */}
          <button
            onClick={handleGenerateVeo}
            disabled={loading}
            className="flex flex-col items-center justify-center gap-2 bg-red-100 text-red-700 p-6 rounded-2xl font-bold hover:bg-red-200 transition-transform active:scale-95 border-2 border-red-300"
          >
            <Video size={32} />
            <span>Real Movie (Veo)</span>
            <span className="text-xs bg-red-300 text-red-900 px-2 py-1 rounded-full flex items-center gap-1">
                <KeyRound size={10} /> Paid Key Required
            </span>
          </button>
      </div>

      {!hasKey && (
         <p className="text-xs text-gray-400 mt-4 text-center">
            * "Real Movie" requires a paid Google Cloud project key.
         </p>
      )}
    </div>
  );
};

export default VideoGenerator;
