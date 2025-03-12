export type ColorScheme = 'green' | 'red' | 'blue' | 'amber' | 'white';

export interface ThemeType {
  primary: string;
  background: string;
  text: string;
  cursor: string;
  highlight: string;
  font: string;
}

export interface CommandResult {
  output: string;
  updatedState: GameState;
  isError?: boolean;
}

export interface GameState {
  location: string;
  inventory: string[];
  visited: Record<string, boolean>;
  gameProgress: number;
  health: number;
  gameOver: boolean;
  won: boolean;
}

export interface HistoryEntry {
  command: string;
  result: string;
  isError?: boolean;
}
