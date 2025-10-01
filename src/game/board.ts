import type { LevelData } from "../levels";

export function createEmptyBoard(rows: number, cols: number): LevelData {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => 0)
  );
}

export type BlockOrientation = "h" | "v";

export function canPlaceBlock(
  board: LevelData,
  row: number,
  col: number,
  length: number,
  orientation: BlockOrientation
): boolean {
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  const w = orientation === "h" ? length : 1;
  const h = orientation === "v" ? length : 1;

  if (row < 0 || col < 0) {
    return false;
  }

  if (row + h > rows || col + w > cols) {
    return false;
  }

  for (let r = row; r < row + h; r += 1) {
    for (let c = col; c < col + w; c += 1) {
      if (board[r][c] !== 0) {
        return false;
      }
    }
  }
  return true;
}

export function placeBlock(
  board: LevelData,
  row: number,
  col: number,
  length: number,
  orientation: BlockOrientation,
  colorIndex: number
): LevelData {
  const next = board.map((line) => line.slice());
  const w = orientation === "h" ? length : 1;
  const h = orientation === "v" ? length : 1;
  for (let r = row; r < row + h; r += 1) {
    for (let c = col; c < col + w; c += 1) {
      next[r][c] = colorIndex;
    }
  }
  return next;
}

export function canPlaceWithSupport(
  board: LevelData,
  row: number,
  col: number,
  length: number,
  orientation: BlockOrientation
): boolean {
  if (!canPlaceBlock(board, row, col, length, orientation)) {
    return false;
  }
  const rows = board.length;
  const cols = rows > 0 ? board[0].length : 0;
  if (cols === 0) {
    return false;
  }
  if (orientation === "h") {
    for (let c = col; c < col + length; c += 1) {
      const rBelow = row + 1;
      if (row === rows - 1) {
        continue;
      }
      if (rBelow < rows && board[rBelow][c] !== 0) {
        continue;
      }
      return false;
    }
    return true;
  }

  const bottomRow = row + length - 1;
  if (bottomRow >= rows) {
    return false;
  }
  if (bottomRow === rows - 1) {
    return true;
  }
  return board[bottomRow + 1][col] !== 0;
}

export function removeBlock(
  board: LevelData,
  row: number,
  col: number,
  length: number,
  orientation: BlockOrientation
): LevelData {
  const next = board.map((line) => line.slice());
  const w = orientation === "h" ? length : 1;
  const h = orientation === "v" ? length : 1;
  for (let r = row; r < row + h; r += 1) {
    for (let c = col; c < col + w; c += 1) {
      next[r][c] = 0;
    }
  }
  return next;
}
