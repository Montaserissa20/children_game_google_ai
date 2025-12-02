
import React, { useState, useEffect } from 'react';
import { generateSpeech, generateImage } from '../services/gemini';
import { playPcmAudio } from '../utils/audio';
import { Volume2, Play, Square, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

const STORY_TEXT = `Welcome to Magic Animal Adventure!
Choose your favorite friend and let’s begin our journey!
We will read a fun story, solve puzzles, color pictures, and discover secret codes together.
Are you ready, explorer? Let’s go!`;

const STORY_FRAMES = [
  "Cartoon illustration of Lily the Cat Explorer waving hello, happy expression, bright colors, children book style",
  "Cartoon illustration of Lily the Cat Explorer walking into a magical colorful forest, children book style",
  "Cartoon illustration of Lily the Cat Explorer discovering a glowing treasure chest in the woods, children book style",
  "Cartoon illustration of Lily the Cat Explorer smiling proudly holding the treasure, children book style"
];

const StoryTime: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isImagesLoading, setIsImagesLoading] = useState(false);
  const [storyImages, setStoryImages] = useState<string[]>([]);
  
  useEffect(() => {
    // Cleanup if component unmounts
    return () => {
      setIsPlaying(false);
    };
  }, []);

  const playStory = async () => {
    if (isPlaying) {
        // Simple toggle state for UI, actual audio stop is tricky with global util without storing context/source
        // For this simple app, we just let it finish or refresh to stop.
        // A full implementation would return the stop function from playPcmAudio.
        setIsPlaying(false);
        return;
    }

    setIsAudioLoading(true);
    try {
      const audioBufferData = await generateSpeech(STORY_TEXT);
      setIsPlaying(true);
      await playPcmAudio(audioBufferData);
      setIsPlaying(false);
    } catch (err) {
      console.error("Audio playback failed", err);
      alert("Could not tell the story right now.");
      setIsPlaying(false);
    } finally {
      setIsAudioLoading(false);
    }
  };

  const generateStoryImages = async () => {
    setIsImagesLoading(true);
    setStoryImages([]);
    try {
      // Generate images one by one or in parallel
      const promises = STORY_FRAMES.map(prompt => generateImage(prompt));
      const results = await Promise.all(promises);
      setStoryImages(results);
    } catch (e) {
      console.error(e);
      alert("Could not paint the story pictures right now.");
    } finally {
      setIsImagesLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full pb-8">
      <div className="bg-green-100 p-6 rounded-full inline-block mb-6">
        <Volume2 size={48} className="text-green-500" />
      </div>
      
      <h2 className="text-3xl font-bold text-green-600 mb-6">Story Time</h2>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-green-100 max-w-lg mb-8 text-center">
        <p className="text-xl leading-relaxed text-gray-700 whitespace-pre-line font-medium">
          {STORY_TEXT}
        </p>
      </div>

      <div className="flex gap-4 mb-12">
        <button
            onClick={playStory}
            disabled={isAudioLoading}
            className={`flex items-center gap-3 px-8 py-4 rounded-full text-xl font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            isPlaying 
                ? 'bg-red-400 text-white' 
                : 'bg-green-500 text-white'
            }`}
        >
            {isAudioLoading ? (
                <Loader2 className="animate-spin" />
            ) : isPlaying ? (
                <>
                    <Volume2 fill="currentColor" size={20} /> Playing...
                </>
            ) : (
                <>
                    <Play fill="currentColor" size={20} /> Read to Me
                </>
            )}
        </button>
      </div>

      {/* Visual Story Section */}
      <div className="w-full max-w-4xl border-t-4 border-dashed border-green-200 pt-8 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
            <ImageIcon /> Picture Story
        </h3>
        
        {!storyImages.length && !isImagesLoading && (
             <button
                onClick={generateStoryImages}
                className="flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold hover:bg-yellow-500 transition-colors shadow-md"
            >
                <Sparkles size={20} /> Create Story Pictures
            </button>
        )}

        {isImagesLoading && (
             <div className="flex flex-col items-center text-green-500">
                <Loader2 className="animate-spin w-10 h-10 mb-2" />
                <p>Painting the adventure...</p>
             </div>
        )}

        {storyImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {storyImages.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-md border-4 border-white relative group">
                        <img src={img} alt={`Story frame ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {idx + 1}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryTime;
