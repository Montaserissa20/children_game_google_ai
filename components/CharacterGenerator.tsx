
import React, { useState } from 'react';
import { Character } from '../types';
import { generateImage, editImage, generateSpeech } from '../services/gemini';
import { playPcmAudio } from '../utils/audio';
import { Wand2, RefreshCw, Edit, Loader2, Volume2 } from 'lucide-react';

const CHARACTERS: Character[] = [
  { id: 'lily', name: 'Lily the Cat', description: 'Explorer', color: 'text-pink-500', basePrompt: 'Lily the Cat Explorer, Cartoon style, Friendly smile, Simple shapes, Bright colors, white background' },
  { id: 'bobo', name: 'Bobo the Bear', description: 'Scientist', color: 'text-blue-500', basePrompt: 'Bobo the Bear Scientist, Wearing glasses, Cute, round shapes, white background' },
  { id: 'mimi', name: 'Mimi the Rabbit', description: 'Artist', color: 'text-purple-500', basePrompt: 'Mimi the Rabbit Artist, Holding a paintbrush, cute cartoon, white background' },
  { id: 'zuzu', name: 'Zuzu the Bird', description: 'Adventurer', color: 'text-green-500', basePrompt: 'Zuzu the Bird Adventurer, Colorful wings, Excited expression, cartoon, white background' },
];

const CharacterGenerator: React.FC = () => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async (char: Character) => {
    setSelectedChar(char);
    setLoading(true);
    setImageUrl(null);
    setIsEditing(false);
    try {
      // 1. Generate Image
      const url = await generateImage(char.basePrompt);
      setImageUrl(url);

      // 2. Generate Voice (Name)
      // We don't await this to block UI, but we trigger it
      generateSpeech(`Hi! I am ${char.name}!`)
        .then(audioData => playPcmAudio(audioData))
        .catch(err => console.error("Voice failed", err));

    } catch (e) {
      console.error(e);
      alert("Oops! Could not make the picture. Try again?");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!imageUrl || !editPrompt) return;
    setLoading(true);
    try {
      const newUrl = await editImage(imageUrl, editPrompt);
      setImageUrl(newUrl);
      setEditPrompt('');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Magic wand fizzled! Try a different spell.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">Meet Your Friends!</h2>

      {/* Character Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-8">
        {CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => handleGenerate(char)}
            disabled={loading}
            className={`p-4 rounded-2xl border-4 transition-all hover:scale-105 ${
              selectedChar?.id === char.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className={`text-xl font-bold ${char.color}`}>{char.name}</div>
            <div className="text-sm text-gray-500">{char.description}</div>
          </button>
        ))}
      </div>

      {/* Display Area */}
      <div className="w-full max-w-md bg-gray-50 rounded-3xl border-4 border-dashed border-gray-300 min-h-[300px] flex items-center justify-center relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center animate-bounce text-blue-400">
            <Loader2 className="w-12 h-12 animate-spin mb-2" />
            <p>Making Magic...</p>
          </div>
        ) : imageUrl ? (
          <div className="relative w-full h-full">
            <img src={imageUrl} alt="Generated Character" className="w-full h-full object-contain" />
            <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-full animate-pulse text-blue-500">
                <Volume2 size={24} />
            </div>
          </div>
        ) : (
          <p className="text-gray-400 text-center p-4">Pick a friend above to say hello!</p>
        )}
      </div>

      {/* Edit Controls */}
      {imageUrl && !loading && (
        <div className="mt-6 w-full max-w-md">
          {isEditing ? (
            <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 shadow-lg">
              <label className="block text-sm font-bold text-purple-600 mb-2">Magic Wand Command:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="e.g., Add a wizard hat"
                  className="flex-1 border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleEdit}
                  className="bg-purple-500 text-white p-3 rounded-xl hover:bg-purple-600"
                >
                  <Wand2 size={20} />
                </button>
              </div>
              <button onClick={() => setIsEditing(false)} className="text-xs text-gray-400 mt-2 underline">Cancel</button>
            </div>
          ) : (
             <div className="flex gap-4 justify-center">
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-purple-100 text-purple-600 px-6 py-3 rounded-full font-bold hover:bg-purple-200 transition-colors"
                >
                    <Edit size={20} />
                    Magic Edit
                </button>
                <button
                    onClick={() => selectedChar && handleGenerate(selectedChar)}
                    className="flex items-center gap-2 bg-blue-100 text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-blue-200 transition-colors"
                >
                    <RefreshCw size={20} />
                    New Picture
                </button>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterGenerator;
