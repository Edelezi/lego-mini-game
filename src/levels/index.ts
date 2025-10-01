export type LevelData = number[][];

import { LEGO_COLORS } from "../theme/colors";

export const PALETTE: Record<number, string> = {
  0: "transparent",
  1: LEGO_COLORS.yellow,
  2: LEGO_COLORS.black,
  3: LEGO_COLORS.gray,
  4: LEGO_COLORS.darkGray,
  5: LEGO_COLORS.red,
};

// Smiley face
export const level1: LevelData = [
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 2, 2, 1, 1, 2, 2, 1, 1],
  [1, 1, 2, 2, 1, 1, 2, 2, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 2, 2, 1, 1, 2, 2, 1, 1],
  [0, 1, 1, 1, 2, 2, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
];

// Castle
export const level2: LevelData = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 5, 5, 0, 0, 0, 0],
  [0, 0, 0, 5, 5, 5, 5, 0, 0, 0],
  [0, 0, 5, 5, 3, 3, 5, 5, 0, 0],
  [0, 5, 5, 3, 2, 2, 3, 5, 5, 0],
  [3, 3, 3, 3, 2, 2, 3, 3, 3, 3],
  [3, 2, 2, 3, 3, 3, 3, 2, 2, 3],
  [3, 2, 2, 3, 1, 1, 3, 2, 2, 3],
  [3, 3, 3, 3, 1, 1, 3, 3, 3, 3],
  [3, 3, 3, 3, 1, 1, 3, 3, 3, 3],
];

type Level = {
  name: string;
  level: LevelData;
};

export const levels: Level[] = [
  {
    name: "Smiley Face",
    level: level1,
  },
  {
    name: "Castle",
    level: level2,
  },
];
