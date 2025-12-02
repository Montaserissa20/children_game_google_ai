import React from 'react';
import { AppMode } from '../types';
import { Home, Cat, BookOpen, Puzzle, Palette, Video } from 'lucide-react';

interface LayoutProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentMode, setMode, children }) => {
  const navItems = [
    { mode: AppMode.HOME, icon: Home, label: 'Home', color: 'bg-orange-400' },
    { mode: AppMode.CHARACTERS, icon: Cat, label: 'Friends', color: 'bg-blue-400' },
    { mode: AppMode.STORY, icon: BookOpen, label: 'Story', color: 'bg-green-400' },
    { mode: AppMode.PUZZLE, icon: Puzzle, label: 'Game', color: 'bg-purple-400' },
    { mode: AppMode.COLORING, icon: Palette, label: 'Color', color: 'bg-pink-400' },
    { mode: AppMode.VIDEO, icon: Video, label: 'Movie', color: 'bg-red-400' },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col font-fredoka">
      {/* Top Bar */}
      <header className="bg-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-orange-500 flex items-center gap-2">
            🦁 Magic Animal Adventure
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-xl p-6 min-h-[60vh] border-4 border-yellow-200">
            {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white p-2 shadow-inner sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-around items-center gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setMode(item.mode)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[70px] transition-all transform ${
                  isActive 
                    ? `${item.color} text-white scale-110 -translate-y-2 shadow-lg` 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <Icon size={isActive ? 28 : 24} strokeWidth={2.5} />
                <span className="text-xs font-bold mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
