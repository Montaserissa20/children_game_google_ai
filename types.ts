export enum AppMode {
  HOME = 'HOME',
  CHARACTERS = 'CHARACTERS',
  STORY = 'STORY',
  PUZZLE = 'PUZZLE',
  COLORING = 'COLORING',
  VIDEO = 'VIDEO'
}

export interface Character {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  color: string;
}

export interface PuzzleItem {
  emoji: string;
  value: number;
  name: string;
}

export interface GeneratedAsset {
  type: 'image' | 'audio' | 'video';
  url: string;
  prompt?: string;
}
