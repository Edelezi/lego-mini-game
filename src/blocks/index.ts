import type { LevelData } from "../levels";

export type BlockOrientation = "h" | "v";
export type BlockLength = 1 | 2 | 3 | 4;

export type Block = {
  id: string;
  colorIndex: number;
  length: BlockLength;
  orientation: BlockOrientation;
  col: number;
  row: number;
};

export type PlacedBlock = {
  id: string;
  colorIndex: number;
  length: BlockLength;
  orientation: BlockOrientation;
  row: number;
  col: number;
};

export type BlocksArea = {
  rows: number;
  cols: number;
};

function randomInt(min: number, maxInclusive: number) {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createOccupancy(area: BlocksArea): boolean[][] {
  return Array.from({ length: area.rows }, () =>
    Array.from({ length: area.cols }, () => false)
  );
}

function canPlace(
  occ: boolean[][],
  area: BlocksArea,
  row: number,
  col: number,
  wCells: number,
  hCells: number
) {
  if (col < 0 || row < 0) return false;
  if (col + wCells > area.cols) return false;
  if (row + hCells > area.rows) return false;
  for (let r = row; r < row + hCells; r += 1) {
    for (let c = col; c < col + wCells; c += 1) {
      if (occ[r][c]) return false;
    }
  }
  return true;
}

function markPlaced(
  occ: boolean[][],
  row: number,
  col: number,
  wCells: number,
  hCells: number
) {
  for (let r = row; r < row + hCells; r += 1) {
    for (let c = col; c < col + wCells; c += 1) {
      occ[r][c] = true;
    }
  }
}

export function getLevelArea(level: LevelData) {
  const rows = level.length;
  const cols = rows > 0 ? level[0].length : 0;
  return { rows, cols };
}

export function getBlocksArea(
  level: LevelData,
  extraCols: number = 8
): BlocksArea {
  const { rows } = getLevelArea(level);
  return { rows, cols: Math.max(1, extraCols) };
}

export function generateBlocks(
  level: LevelData,
  count: number,
  paletteIndices: number[],
  blocksCols: number = 8
): Block[] {
  const area = getBlocksArea(level, blocksCols);
  const occupancy = createOccupancy(area);
  const lengths: BlockLength[] = [1, 2, 3, 4];
  const result: Block[] = [];

  const maxAttempts = Math.max(50, count * 10);
  let attempts = 0;

  while (result.length < count && attempts < maxAttempts) {
    attempts += 1;
    const length = pickRandom(lengths);
    const orientation: BlockOrientation = Math.random() < 0.5 ? "h" : "v";
    const wCells = orientation === "h" ? length : 1;
    const hCells = orientation === "v" ? length : 1;
    const row = randomInt(0, area.rows - hCells);
    const col = randomInt(0, area.cols - wCells);
    if (!canPlace(occupancy, area, row, col, wCells, hCells)) continue;

    const colorIndex = pickRandom(paletteIndices);
    const id = `${Date.now()}_${result.length}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    result.push({ id, colorIndex, length, orientation, row, col });
    markPlaced(occupancy, row, col, wCells, hCells);
  }

  return result;
}
