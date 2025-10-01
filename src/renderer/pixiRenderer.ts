import { Application, Container, Graphics } from "pixi.js";
import type { LevelData } from "../levels";
import type { PlacedBlock } from "../blocks";

export type RenderOptions = {
  level: LevelData;
  palette: Record<number, string>;
  cellSize?: number;
  gap?: number;
  background?: string;
  placed?: PlacedBlock[];
};

export function getLevelDimensions(level: LevelData, cellSize: number) {
  const rows = level.length;
  const cols = rows > 0 ? level[0].length : 0;
  return { width: cols * cellSize, height: rows * cellSize, rows, cols };
}

function drawLevel(
  container: Container,
  level: LevelData,
  palette: Record<number, string>,
  cellSize: number,
  gap: number,
  placed?: PlacedBlock[]
) {
  container.removeChildren();
  const rows = level.length;
  if (rows === 0) return;
  const cols = level[0].length;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const value = level[r][c];
      if (value === 0) {
        continue;
      }

      const color = palette[value] ?? "#ffffff";
      const x = c * cellSize;
      const y = r * cellSize;
      const size = Math.max(1, cellSize - gap);

      const g = new Graphics();
      g.rect(x, y, size, size).fill(color);
      container.addChild(g);
    }
  }

  if (placed && placed.length > 0) {
    for (const b of placed) {
      const wCells = b.orientation === "h" ? b.length : 1;
      const hCells = b.orientation === "v" ? b.length : 1;
      let matches = true;
      for (let rr = 0; rr < hCells && matches; rr += 1) {
        const r = b.row + rr;
        if (r < 0 || r >= rows) {
          matches = false;
          break;
        }
        for (let cc = 0; cc < wCells; cc += 1) {
          const c = b.col + cc;
          if (c < 0 || c >= cols) {
            matches = false;
            break;
          }
          if (level[r][c] !== b.colorIndex) {
            matches = false;
            break;
          }
        }
      }
      if (!matches) continue;

      const x = b.col * cellSize;
      const y = b.row * cellSize;
      const w = Math.max(1, wCells * cellSize - gap);
      const h = Math.max(1, hCells * cellSize - gap);

      const outline = new Graphics();
      outline
        .rect(x - 0.5, y - 0.5, w + 1, h + 1)
        .stroke({ width: 2, color: 0x000000, alpha: 0.5 });
      container.addChild(outline);
    }
  }
}

export type LevelRenderContext = {
  app: Application;
  redraw: (level: LevelData, placed?: PlacedBlock[]) => void;
  destroy: () => void;
  pointToCell: (x: number, y: number) => { col: number; row: number };
  cellSize: number;
};

export async function renderLevelTo(
  container: HTMLElement,
  options: RenderOptions
): Promise<LevelRenderContext> {
  const cellSize = options.cellSize ?? 32;
  const gap = options.gap ?? 1;
  const background = options.background ?? "#111827";

  const { width, height } = getLevelDimensions(options.level, cellSize);

  const app = new Application();
  await app.init({ width, height, background });

  container.replaceChildren(app.canvas);

  const boardContainer = new Container();
  app.stage.addChild(boardContainer);

  drawLevel(
    boardContainer,
    options.level,
    options.palette,
    cellSize,
    gap,
    options.placed
  );

  const redraw = (level: LevelData, placedParam?: PlacedBlock[]) => {
    const dims = getLevelDimensions(level, cellSize);
    if (
      dims.width !== app.renderer.width ||
      dims.height !== app.renderer.height
    ) {
      app.renderer.resize(dims.width, dims.height);
    }
    drawLevel(
      boardContainer,
      level,
      options.palette,
      cellSize,
      gap,
      placedParam ?? options.placed
    );
  };

  const destroy = () => {
    app.destroy();
  };

  const pointToCell = (x: number, y: number) => ({
    col: Math.floor(x / cellSize),
    row: Math.floor(y / cellSize),
  });

  return { app, redraw, destroy, pointToCell, cellSize };
}
