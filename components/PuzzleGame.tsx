
import React, { useState, useEffect, useRef } from 'react';
import { PuzzleItem } from '../types';
import { generateSpeech } from '../services/gemini';
import { playPcmAudio } from '../utils/audio';
import { Check, X, ArrowRight, Brain, Grid, Sun, Moon } from 'lucide-react';

type GameMode = 'MENU' | 'CODE' | 'PATTERN' | 'ODD' | 'SHADOW';

const EMOJIS = ['🐱', '🐰', '🐻', '🦊', '🦁', '🐸'];

// --- Game 1: Secret Code Data ---
const CODE_LEGEND: PuzzleItem[] = [
  { emoji: '🐱', value: 1, name: 'Cat' },
  { emoji: '🐰', value: 2, name: 'Bunny' },
  { emoji: '🐻', value: 3, name: 'Bear' },
];
const CODE_PUZZLES = [
  { sequence: ['🐱', '🐰', '🐻'], answer: '123' }, // Level 1
  { sequence: ['🐻', '🐱', '🐱'], answer: '311' }, // Level 2
  { sequence: ['🐰', '🐻', '🐱'], answer: '231' }, // Level 3
];

const PuzzleGame: React.FC = () => {
  const [mode, setMode] = useState<GameMode>('MENU');
  
  // Game State
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [userAnswer, setUserAnswer] = useState('');
  
  // Dynamic Puzzle Data
  const [patternSequence, setPatternSequence] = useState<string[]>([]);
  const [patternOptions, setPatternOptions] = useState<string[]>([]);
  const [patternAnswer, setPatternAnswer] = useState('');

  const [oddItems, setOddItems] = useState<string[]>([]);
  const [oddAnswer, setOddAnswer] = useState('');

  const [shadowTarget, setShadowTarget] = useState('');
  const [shadowOptions, setShadowOptions] = useState<string[]>([]);

  // Audio Cache to prevent repeated API calls
  const audioCache = useRef<Record<string, ArrayBuffer>>({});

  useEffect(() => {
    if (mode === 'PATTERN') startPatternLevel();
    if (mode === 'ODD') startOddLevel();
    if (mode === 'SHADOW') startShadowLevel();
    if (mode === 'CODE') startCodeLevel();
  }, [mode, level]);

  // Handle Voice Narration on Mode Change
  useEffect(() => {
    const playModeAudio = async () => {
        let text = "";
        switch(mode) {
            case 'MENU': text = "Choose a Game!"; break;
            case 'CODE': text = "Secret Code"; break;
            case 'PATTERN': text = "What Comes Next?"; break;
            case 'ODD': text = "Find the Odd One Out!"; break;
            case 'SHADOW': text = "Who is this?"; break;
        }

        if (!text) return;

        try {
            if (audioCache.current[text]) {
                await playPcmAudio(audioCache.current[text]);
            } else {
                const audio = await generateSpeech(text);
                audioCache.current[text] = audio;
                await playPcmAudio(audio);
            }
        } catch (e) {
            console.error("Audio playback error", e);
        }
    };
    
    playModeAudio();
  }, [mode]);

  // --- Level Generators ---

  const startCodeLevel = () => {
      setUserAnswer('');
      setStatus('playing');
  };

  const startPatternLevel = () => {
    // Pattern: A B A B ?
    const a = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    let b = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    while (b === a) b = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    
    setPatternSequence([a, b, a, b]);
    setPatternAnswer(a);
    
    // Options
    setPatternOptions([a, b]);
    setStatus('playing');
  };

  const startOddLevel = () => {
    // Odd One Out: A A A B
    const main = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    let odd = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    while (odd === main) odd = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const items = [main, main, main, odd];
    // Simple shuffle
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    setOddItems(items);
    setOddAnswer(odd);
    setStatus('playing');
  };

  const startShadowLevel = () => {
    // Shadow matching
    const target = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    let opt1 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    while(opt1 === target) opt1 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    let opt2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    while(opt2 === target || opt2 === opt1) opt2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const opts = [target, opt1, opt2];
    opts.sort(() => Math.random() - 0.5);

    setShadowTarget(target);
    setShadowOptions(opts);
    setStatus('playing');
  };

  // --- Interactions ---

  const handleCorrect = () => {
      setStatus('correct');
      setScore(s => s + 1);
  };

  const handleWrong = () => {
      setStatus('wrong');
      setTimeout(() => setStatus('playing'), 1000);
  };

  const nextLevel = () => {
      if (mode === 'CODE' && level >= 2) {
          // Finished all code levels
          backToMenu();
      } else {
          setLevel(l => l + 1);
          setStatus('playing');
          setUserAnswer('');
      }
  };

  const backToMenu = () => {
      setMode('MENU');
      setScore(0);
      setLevel(0);
  };

  // --- Game Renders ---

  const renderCodeGame = () => {
    const puzzleIndex = level % CODE_PUZZLES.length;
    const puzzle = CODE_PUZZLES[puzzleIndex];
    
    const handleInput = (val: number) => {
        if (userAnswer.length >= 3) return;
        const newAns = userAnswer + val.toString();
        setUserAnswer(newAns);
        
        if (newAns.length === 3) {
            if (newAns === puzzle.answer) handleCorrect();
            else {
                setStatus('wrong');
                setTimeout(() => setUserAnswer(''), 1000);
            }
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-purple-600 mb-2">Secret Code</h3>
            <p className="text-purple-400 mb-6 font-bold">Level {level + 1} / 3</p>

             {/* Legend */}
            <div className="flex gap-4 mb-8 bg-purple-50 p-4 rounded-2xl border-2 border-purple-100">
                {CODE_LEGEND.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                    <span className="text-4xl mb-1">{item.emoji}</span>
                    <span className="text-2xl font-bold text-purple-400">= {item.value}</span>
                </div>
                ))}
            </div>
             {/* Sequence */}
            <div className="flex justify-center gap-4 mb-8">
                {puzzle.sequence.map((emoji, idx) => (
                    <div key={idx} className="text-6xl">{emoji}</div>
                ))}
            </div>
             {/* Inputs */}
             <div className="flex justify-center gap-4 mb-8">
                {[0, 1, 2].map((i) => (
                    <div key={i} className={`w-16 h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-bold z-10 ${
                        status === 'correct' 
                        ? 'border-green-400 bg-green-50 text-green-600' 
                        : 'border-gray-200 bg-gray-50 text-black'
                    }`}>
                        {userAnswer.charAt(i)}
                    </div>
                ))}
            </div>
             {/* Keypad */}
             {status !== 'correct' && (
                <div className="flex gap-4">
                    {[1, 2, 3].map((num) => (
                        <button key={num} onClick={() => handleInput(num)} className="w-16 h-16 rounded-full bg-purple-500 text-white text-3xl font-bold shadow-lg active:scale-95 hover:bg-purple-600 transition-colors">
                            {num}
                        </button>
                    ))}
                    <button onClick={() => setUserAnswer('')} className="w-16 h-16 rounded-full bg-gray-200 text-gray-500 text-xl font-bold hover:bg-gray-300 transition-colors">X</button>
                </div>
             )}
        </div>
    );
  };

  const renderPatternGame = () => {
      return (
          <div className="flex flex-col items-center">
              <h3 className="text-2xl font-bold text-blue-600 mb-6">What Comes Next?</h3>
              <div className="flex items-center gap-4 mb-10 bg-blue-50 p-6 rounded-3xl">
                  {patternSequence.map((e, i) => (
                      <div key={i} className="text-6xl">{e}</div>
                  ))}
                  <div className="w-16 h-16 border-4 border-dashed border-blue-300 rounded-xl flex items-center justify-center text-4xl text-blue-300">?</div>
              </div>
              <div className="flex gap-8">
                  {patternOptions.map((opt, i) => (
                      <button 
                        key={i}
                        onClick={() => opt === patternAnswer ? handleCorrect() : handleWrong()}
                        className="text-7xl p-6 bg-white rounded-3xl shadow-xl hover:scale-110 transition-transform border-4 border-transparent hover:border-blue-200"
                      >
                          {opt}
                      </button>
                  ))}
              </div>
          </div>
      );
  };

  const renderOddGame = () => {
      return (
        <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold text-orange-600 mb-6">Find the Odd One Out!</h3>
            <div className="grid grid-cols-2 gap-6">
                {oddItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => item === oddAnswer ? handleCorrect() : handleWrong()}
                        className="text-7xl p-8 bg-white rounded-3xl shadow-lg border-4 border-orange-50 hover:border-orange-300 transition-all active:scale-95"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
      );
  };

  const renderShadowGame = () => {
    return (
      <div className="flex flex-col items-center">
          <h3 className="text-2xl font-bold text-gray-600 mb-6">Who is this?</h3>
          
          <div className="mb-10 p-10 bg-white rounded-full shadow-inner border-4 border-gray-100">
              {/* CSS Filter for Silhouette */}
              <div className="text-9xl filter brightness-0 opacity-100 transform scale-110">
                  {shadowTarget}
              </div>
          </div>

          <div className="flex gap-6">
              {shadowOptions.map((opt, i) => (
                  <button 
                    key={i}
                    onClick={() => opt === shadowTarget ? handleCorrect() : handleWrong()}
                    className="text-7xl p-6 bg-white rounded-2xl shadow-xl border-b-4 border-gray-200 active:translate-y-1 hover:bg-gray-50"
                  >
                      {opt}
                  </button>
              ))}
          </div>
      </div>
    );
  };

  // --- Main Render ---

  if (mode === 'MENU') {
      return (
          <div className="flex flex-col items-center w-full">
               <h2 className="text-3xl font-bold text-purple-600 mb-8">Choose a Game!</h2>
               <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                   <button onClick={() => setMode('CODE')} className="p-6 bg-purple-100 text-purple-700 rounded-3xl font-bold text-xl hover:bg-purple-200 transition-colors flex flex-col items-center gap-2">
                       <Grid size={40} /> Secret Code
                   </button>
                   <button onClick={() => setMode('PATTERN')} className="p-6 bg-blue-100 text-blue-700 rounded-3xl font-bold text-xl hover:bg-blue-200 transition-colors flex flex-col items-center gap-2">
                       <ArrowRight size={40} /> Patterns
                   </button>
                   <button onClick={() => setMode('ODD')} className="p-6 bg-orange-100 text-orange-700 rounded-3xl font-bold text-xl hover:bg-orange-200 transition-colors flex flex-col items-center gap-2">
                       <Brain size={40} /> Odd One Out
                   </button>
                   <button onClick={() => setMode('SHADOW')} className="p-6 bg-gray-200 text-gray-700 rounded-3xl font-bold text-xl hover:bg-gray-300 transition-colors flex flex-col items-center gap-2">
                       <Moon size={40} /> Shadows
                   </button>
               </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center w-full">
        <div className="w-full flex justify-between items-center mb-6">
            <button onClick={backToMenu} className="text-gray-500 font-bold hover:bg-gray-100 px-4 py-2 rounded-xl">
                ← Menu
            </button>
            <div className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-bold">
                Score: {score}
            </div>
        </div>

        <div className="w-full max-w-lg min-h-[400px] flex items-center justify-center relative">
            {status === 'correct' ? (
                <div className="absolute inset-0 z-10 bg-white/90 flex flex-col items-center justify-center animate-fade-in rounded-3xl backdrop-blur-sm">
                    <Check size={80} className="text-green-500 mb-4 drop-shadow-lg" />
                    <h3 className="text-4xl font-bold text-green-600 mb-6">Great Job!</h3>
                    <button onClick={nextLevel} className="bg-green-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl animate-bounce hover:bg-green-600">
                        Next Puzzle →
                    </button>
                </div>
            ) : status === 'wrong' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <X size={100} className="text-red-500 opacity-80 animate-ping" />
                </div>
            )}

            {mode === 'CODE' && renderCodeGame()}
            {mode === 'PATTERN' && renderPatternGame()}
            {mode === 'ODD' && renderOddGame()}
            {mode === 'SHADOW' && renderShadowGame()}
        </div>
    </div>
  );
};

export default PuzzleGame;
