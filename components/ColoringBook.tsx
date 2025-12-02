
import React, { useState, useRef, useEffect } from 'react';
import { generateImage, generateSpeech } from '../services/gemini';
import { playPcmAudio } from '../utils/audio';
import { Palette, Loader2, Download, Eraser, Trash2 } from 'lucide-react';

const THEMES = [
  { name: 'Lily the Cat', prompt: 'Black and white thick line art coloring page of Lily the Cat Explorer, big outline, no shading, no background clutter, white background, children coloring book style, 1024x1024' },
  { name: 'Bobo the Bear', prompt: 'Black and white thick line art coloring page of Bobo the Bear Scientist holding a beaker, thick lines, no shading, no background clutter, white background, children coloring book style, 1024x1024' },
  { name: 'Mimi the Rabbit', prompt: 'Black and white thick line art coloring page of Mimi the Rabbit Artist painting on a canvas, thick lines, no shading, no background clutter, white background, children coloring book style, 1024x1024' },
  { name: 'Zuzu the Bird', prompt: 'Black and white thick line art coloring page of Zuzu the Bird flying above clouds, thick lines, no shading, no background clutter, white background, children coloring book style, 1024x1024' },
];

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#000000', // Black
];

const ColoringBook: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCache = useRef<Record<string, ArrayBuffer>>({});

  // Play "Coloring Fun" on mount
  useEffect(() => {
    const playIntro = async () => {
        const text = "Coloring Fun";
        try {
            if (audioCache.current[text]) {
                await playPcmAudio(audioCache.current[text]);
            } else {
                const audio = await generateSpeech(text);
                audioCache.current[text] = audio;
                await playPcmAudio(audio);
            }
        } catch (e) {
            console.error("Audio error", e);
        }
    };
    playIntro();
  }, []);

  // Clear canvas when new image is loaded
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Resize canvas to match container
        canvas.width = containerRef.current.offsetWidth;
        canvas.height = containerRef.current.offsetHeight;
    }
  }, [image]);

  const handleCreate = async (prompt: string, name: string) => {
    setLoading(true);
    setImage(null);
    setSelectedTheme(name);
    try {
      // 1. Generate Image
      const url = await generateImage(prompt);
      setImage(url);

      // 2. Play Character Name Audio
      try {
        if (audioCache.current[name]) {
            await playPcmAudio(audioCache.current[name]);
        } else {
            const audio = await generateSpeech(name);
            audioCache.current[name] = audio;
            await playPcmAudio(audio);
        }
      } catch (e) {
        console.error("Audio error", e);
      }

    } catch (e) {
      alert("Could not make the page right now!");
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-3xl font-bold text-pink-500 mb-6">Coloring Fun</h2>

      {/* Theme Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6 w-full max-w-lg">
        {THEMES.map((t) => (
          <button
            key={t.name}
            onClick={() => handleCreate(t.prompt, t.name)}
            disabled={loading}
            className={`px-4 py-4 rounded-xl font-bold transition-all transform active:scale-95 ${
                selectedTheme === t.name 
                ? 'bg-pink-500 text-white shadow-lg' 
                : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Drawing Controls (Only show if image exists) */}
      {image && !loading && (
        <div className="flex flex-wrap justify-center gap-4 mb-4 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
            <div className="flex gap-2">
                {COLORS.map(color => (
                    <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                <button onClick={() => setBrushSize(5)} className={`p-2 rounded-lg ${brushSize === 5 ? 'bg-gray-200' : ''}`}><div className="w-2 h-2 bg-black rounded-full" /></button>
                <button onClick={() => setBrushSize(10)} className={`p-2 rounded-lg ${brushSize === 10 ? 'bg-gray-200' : ''}`}><div className="w-4 h-4 bg-black rounded-full" /></button>
                <button onClick={() => setBrushSize(20)} className={`p-2 rounded-lg ${brushSize === 20 ? 'bg-gray-200' : ''}`}><div className="w-6 h-6 bg-black rounded-full" /></button>
            </div>
            <button 
                onClick={clearDrawing}
                className="bg-red-100 text-red-500 p-2 rounded-lg hover:bg-red-200"
                title="Clear Drawing"
            >
                <Trash2 size={20} />
            </button>
        </div>
      )}

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="w-full max-w-md aspect-[3/4] bg-white border-4 border-dashed border-pink-200 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-sm"
      >
        {loading ? (
           <div className="text-pink-400 flex flex-col items-center">
             <Loader2 className="animate-spin w-12 h-12 mb-2" />
             <p className="animate-pulse">Drawing lines...</p>
           </div>
        ) : image ? (
          <>
            <img src={image} alt="Coloring Page" className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" />
            <canvas 
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            />
            
            <a 
                href={image} 
                download={`coloring-${selectedTheme}.png`}
                className="absolute bottom-4 right-4 bg-pink-500 text-white p-3 rounded-full shadow-lg hover:bg-pink-600 hover:scale-110 transition-all z-10"
                title="Download Original"
            >
                <Download size={24} />
            </a>
          </>
        ) : (
          <div className="text-center text-gray-400 p-4">
            <Palette size={64} className="mx-auto mb-4 opacity-50" />
            <p>Pick a friend to create a coloring page!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColoringBook;
