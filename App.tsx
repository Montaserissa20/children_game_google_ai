
import React, { useState, useRef } from 'react';
import Layout from './components/Layout';
import { AppMode } from './types';
import CharacterGenerator from './components/CharacterGenerator';
import StoryTime from './components/StoryTime';
import PuzzleGame from './components/PuzzleGame';
import ColoringBook from './components/ColoringBook';
import VideoGenerator from './components/VideoGenerator';
import { Sparkles, Loader2, Volume2 } from 'lucide-react';
import { generateSpeech } from './services/gemini';
import { playPcmAudio } from './utils/audio';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [loadingAudio, setLoadingAudio] = useState(false);
  
  // Cache the welcome audio so we don't call API every hover
  const welcomeAudioCache = useRef<ArrayBuffer | null>(null);

  const handleHover = async () => {
    if (loadingAudio || welcomeAudioCache.current) {
        if (welcomeAudioCache.current) {
            playPcmAudio(welcomeAudioCache.current);
        }
        return;
    }

    setLoadingAudio(true);
    try {
        const text = "Welcome Explorer! Pick a button below to start your Magic Animal Adventure! Let's Go!";
        const audioData = await generateSpeech(text);
        welcomeAudioCache.current = audioData;
        playPcmAudio(audioData);
    } catch (e) {
        console.error("Audio failed", e);
    } finally {
        setLoadingAudio(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case AppMode.CHARACTERS:
        return <CharacterGenerator />;
      case AppMode.STORY:
        return <StoryTime />;
      case AppMode.PUZZLE:
        return <PuzzleGame />;
      case AppMode.COLORING:
        return <ColoringBook />;
      case AppMode.VIDEO:
        return <VideoGenerator />;
      case AppMode.HOME:
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
             <div className="bg-orange-100 p-8 rounded-full">
                <Sparkles size={80} className="text-orange-500 animate-pulse" />
             </div>
             <div>
                <h2 className="text-4xl font-bold text-orange-600 mb-4">Welcome Explorer!</h2>
                <p className="text-xl text-gray-600 max-w-md mx-auto">
                    Pick a button below to start your Magic Animal Adventure!
                </p>
             </div>
             <button 
                onClick={() => setMode(AppMode.CHARACTERS)}
                onMouseEnter={handleHover}
                className="bg-orange-500 text-white text-2xl font-bold py-4 px-10 rounded-full shadow-xl hover:bg-orange-600 transition-transform hover:scale-105 flex items-center gap-3"
            >
                {loadingAudio ? <Loader2 className="animate-spin" /> : <Volume2 className="animate-pulse" />}
                Let's Go! 🚀
             </button>
          </div>
        );
    }
  };

  return (
    <Layout currentMode={mode} setMode={setMode}>
      {renderContent()}
    </Layout>
  );
};

export default App;
