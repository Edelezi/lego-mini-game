import { useCallback, useEffect, useMemo, useState } from "react";
import type { LevelData } from "../levels";
import { levels } from "../levels";
import type { Block, PlacedBlock } from "../blocks";
import { generateBlocks } from "../blocks";
import {
  canPlaceBlock,
  createEmptyBoard,
  placeBlock,
  removeBlock,
} from "./board";
import { GameContext, type GameContextValue } from "./context";

function boardsEqual(a: LevelData, b: LevelData): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let r = 0; r < a.length; r += 1) {
    if (a[r].length !== b[r].length) {
      return false;
    }
    for (let c = 0; c < a[r].length; c += 1) {
      if (a[r][c] !== b[r][c]) {
        return false;
      }
    }
  }
  return true;
}

function getPaletteIndices(level: LevelData) {
  const set = new Set<number>();
  for (const row of level) {
    for (const cell of row) {
      if (cell !== 0) set.add(cell);
    }
  }
  return Array.from(set);
}

const BLOCKS_COLS = 8;
const BLOCKS_COUNT = 12;

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = levels[levelIndex].level;

  const [board, setBoard] = useState<LevelData>(() =>
    createEmptyBoard(currentLevel.length, currentLevel[0]?.length ?? 0)
  );
  const [held, setHeld] = useState<Block | null>(null);
  const [placed, setPlaced] = useState<PlacedBlock[]>([]);
  const [paletteIndices, setPaletteIndices] = useState<number[]>(
    getPaletteIndices(currentLevel)
  );
  const [blocks, setBlocks] = useState<Block[]>(() =>
    generateBlocks(currentLevel, BLOCKS_COUNT, paletteIndices, BLOCKS_COLS)
  );
  const [refreshes, setRefreshes] = useState(0);

  const [levelStartAtMs, setLevelStartAtMs] = useState<number>(() =>
    Date.now()
  );
  const [levelElapsedMs, setLevelElapsedMs] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (isCompleted) return;
    const id = window.setInterval(() => {
      setLevelElapsedMs(Date.now() - levelStartAtMs);
    }, 1000);
    return () => window.clearInterval(id);
  }, [levelStartAtMs, isCompleted]);

  const checkCompletion = useCallback(
    (nextBoard: LevelData) => {
      if (isCompleted) {
        return;
      }
      if (boardsEqual(nextBoard, currentLevel)) {
        setIsCompleted(true);
        setLevelElapsedMs(Date.now() - levelStartAtMs);
      }
    },
    [isCompleted, currentLevel, levelStartAtMs]
  );

  const pick = useCallback((b: Block) => setHeld(b), []);

  const drop = useCallback(
    (row: number, col: number) => {
      if (!held) {
        return;
      }
      if (!canPlaceBlock(board, row, col, held.length, "h")) {
        return;
      }
      const next = placeBlock(
        board,
        row,
        col,
        held.length,
        "h",
        held.colorIndex
      );
      setBoard(next);
      checkCompletion(next);
      setPlaced((prev) => [
        ...prev,
        {
          id: held.id,
          colorIndex: held.colorIndex,
          length: held.length,
          orientation: "h",
          row,
          col,
        },
      ]);
      setBlocks((prev) => (prev ? prev.filter((x) => x.id !== held.id) : prev));
      setHeld(null);
    },
    [held, board, checkCompletion]
  );

  const pickFromBoard = useCallback(
    (row: number, col: number) => {
      const color = board[row]?.[col] ?? 0;
      if (color === 0) return;

      const match = placed.find((pb) => {
        if (pb.orientation === "h") {
          return (
            pb.colorIndex === color &&
            row === pb.row &&
            col >= pb.col &&
            col < pb.col + pb.length
          );
        }
        return (
          pb.colorIndex === color &&
          col === pb.col &&
          row >= pb.row &&
          row < pb.row + pb.length
        );
      });

      if (!match) {
        return;
      }

      const next = removeBlock(
        board,
        match.row,
        match.col,
        match.length,
        match.orientation
      );
      setBoard(next);
      checkCompletion(next);
      setPlaced((prev) => prev.filter((p) => p !== match));

      const restored: Block = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        colorIndex: match.colorIndex,
        length: match.length,
        orientation: match.orientation,
        row: 0,
        col: 0,
      };
      setBlocks((prev) => (prev ? [restored, ...prev] : [restored]));
    },
    [board, placed, checkCompletion]
  );

  const refreshBlocks = useCallback(() => {
    if (paletteIndices.length === 0) {
      setBlocks([]);
      return;
    }
    const regenerated = generateBlocks(
      currentLevel,
      BLOCKS_COUNT,
      paletteIndices,
      BLOCKS_COLS
    );
    setBlocks(regenerated);
    setRefreshes((n) => n + 1);
  }, [currentLevel, paletteIndices]);

  const incrementRefreshes = useCallback(() => {
    setRefreshes((n) => n + 1);
  }, []);

  const reset = useCallback(() => {
    setHeld(null);
    setBlocks([]);
    setPlaced([]);
    setBoard([]);
    setBlocks([]);
    setRefreshes(0);
    setLevelStartAtMs(Date.now());
    setLevelElapsedMs(0);
    setIsCompleted(false);
  }, []);

  const changeLevel = useCallback(
    (idx: number) => {
      reset();

      const level = levels[idx].level;
      const palette = getPaletteIndices(level);
      setPaletteIndices(palette);
      setLevelIndex(idx);
      setBoard(createEmptyBoard(level.length, level[0]?.length ?? 0));
      const initial = generateBlocks(level, BLOCKS_COUNT, palette, BLOCKS_COLS);
      setBlocks(initial);
    },
    [reset]
  );

  const value = useMemo<GameContextValue>(
    () => ({
      levelIndex,
      currentLevel,
      board,
      held,
      placed,
      paletteIndices,
      blocks,
      refreshes,
      levelElapsedMs,
      isCompleted,
      changeLevel,
      pick,
      drop,
      pickFromBoard,
      refreshBlocks,
      incrementRefreshes,
    }),
    [
      levelIndex,
      currentLevel,
      board,
      held,
      placed,
      paletteIndices,
      blocks,
      refreshes,
      levelElapsedMs,
      isCompleted,
      changeLevel,
      pick,
      drop,
      pickFromBoard,
      refreshBlocks,
      incrementRefreshes,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
