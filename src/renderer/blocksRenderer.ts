import { Application, Graphics, Rectangle, Container } from "pixi.js";
import type { Block, BlocksArea } from "../blocks";

export type BlocksRenderOptions = {
  blocks: Block[];
  area: BlocksArea;
  palette: Record<number, string>;
  cellSize?: number;
  gap?: number;
  background?: string;
  freeLayout?: boolean; // if true, randomly position blocks within area and allow overlap
  randomRotation?: boolean; // if true, rotate blocks by random angle
};

function createContainerForBlock(
  block: Block,
  palette: Record<number, string>,
  cellSize: number,
  gap: number,
  areaWidth: number,
  areaHeight: number,
  freeLayout: boolean,
  randomRotation: boolean
): Container & {
  dataBlock?: Block;
  baseGraphic?: Graphics;
  hoverOverlay?: Graphics;
  selectedOverlay?: Graphics;
} {
  const color = palette[block.colorIndex] ?? "#ffffff";
  const wCells = block.orientation === "h" ? block.length : 1;
  const hCells = block.orientation === "v" ? block.length : 1;
  const width = Math.max(1, wCells * cellSize - gap);
  const height = Math.max(1, hCells * cellSize - gap);

  const container = new Container() as Container & {
    dataBlock?: Block;
    baseGraphic?: Graphics;
    hoverOverlay?: Graphics;
    selectedOverlay?: Graphics;
  };
  container.eventMode = "static";
  container.cursor = "pointer";
  container.dataBlock = block;

  const base = new Graphics();
  base.rect(0, 0, width, height).fill(color);

  const hoverOutline = new Graphics();
  hoverOutline
    .rect(0, 0, width, height)
    .stroke({ width: 2, color: 0x0000ff, alpha: 0.6 });
  hoverOutline.visible = false;

  const selectedOutline = new Graphics();
  selectedOutline
    .rect(-1, -1, width + 2, height + 2)
    .stroke({ width: 3, color: 0x00ffff, alpha: 0.9 });
  selectedOutline.visible = false;

  container.addChild(base, hoverOutline, selectedOutline);
  container.baseGraphic = base;
  container.hoverOverlay = hoverOutline;
  container.selectedOverlay = selectedOutline;

  if (freeLayout) {
    container.pivot.set(width / 2, height / 2);
    const minX = width / 2;
    const maxX = Math.max(minX, areaWidth - width / 2);
    const minY = height / 2;
    const maxY = Math.max(minY, areaHeight - height / 2);
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    container.position.set(x, y);
    if (randomRotation) {
      container.rotation = Math.random() * Math.PI * 2;
    }
    container.hitArea = new Rectangle(0, 0, width, height);
  } else {
    const x = block.col * cellSize;
    const y = block.row * cellSize;
    container.position.set(x, y);
    container.hitArea = new Rectangle(0, 0, width, height);
  }

  return container;
}

export async function renderBlocksTo(
  container: HTMLElement,
  options: BlocksRenderOptions
) {
  const cellSize = options.cellSize ?? 32;
  const gap = options.gap ?? 2;
  const background = options.background ?? "#0b1020";
  const freeLayout = options.freeLayout ?? false;
  const randomRotation = options.randomRotation ?? true;

  const width = options.area.cols * cellSize;
  const height = options.area.rows * cellSize;

  const app = new Application();
  await app.init({ width, height, background });

  container.replaceChildren(app.canvas);
  app.stage.sortableChildren = true;

  const idToGraphic = new Map<string, Container>();

  const syncBlocks = (blocks: Block[]) => {
    for (const [id, g] of Array.from(idToGraphic.entries())) {
      if (!blocks.some((b) => b.id === id)) {
        g.destroy();
        idToGraphic.delete(id);
      }
    }
    for (const block of blocks) {
      if (idToGraphic.has(block.id)) continue;
      const g = createContainerForBlock(
        block,
        options.palette,
        cellSize,
        gap,
        width,
        height,
        freeLayout,
        randomRotation
      );
      app.stage.addChild(g);
      idToGraphic.set(block.id, g);
    }
  };
  syncBlocks(options.blocks);

  const redraw = (blocks: Block[]) => {
    syncBlocks(blocks);
  };
  const destroy = () => app.destroy();

  return { app, redraw, destroy };
}
