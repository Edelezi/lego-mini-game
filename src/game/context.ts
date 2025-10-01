import { createContext, useContext } from "react";
import type { LevelData } from "../levels";
import type { Block, PlacedBlock } from "../blocks";

export type GameContextValue = {
  levelIndex: number;
  currentLevel: LevelData;
  board: LevelData;
  held: Block | null;
  placed: PlacedBlock[];
  paletteIndices: number[];
  blocks: Block[];
  refreshes: number;
  levelElapsedMs: number;
  isCompleted: boolean;
  changeLevel: (idx: number) => void;
  pick: (b: Block) => void;
  drop: (row: number, col: number) => void;
  pickFromBoard: (row: number, col: number) => void;
  refreshBlocks: () => void;
  incrementRefreshes: () => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
