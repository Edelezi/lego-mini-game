import type { Application, Container, Graphics } from "pixi.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateBlocks, getBlocksArea, type Block } from "../blocks";
import { useGame } from "../game/context";
import { PALETTE } from "../levels";
import { renderBlocksTo } from "../renderer/blocksRenderer";

type Props = {
  cellSize?: number;
  background?: string;
  className?: string;
  count?: number;
  blocks?: Block[];
};

type BlocksCtx = {
  redraw: (blocks: Block[]) => void;
  destroy: () => void;
  app: Application;
  cleanup?: () => void;
};

export default function BlocksView({
  cellSize = 32,
  background = "#ffffff",
  className,
  count = 12,
  blocks: blocksProp,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const ctxRef = useRef<BlocksCtx | null>(null);
  const blocksRef = useRef<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const game = useGame();

  const updateSelectionOverlay = useCallback((id: string | null) => {
    if (!ctxRef.current) return;
    const stage = ctxRef.current.app.stage;
    for (let i = 0; i < stage.children.length; i += 1) {
      const child = stage.children[i] as (Graphics | Container) & {
        dataBlock?: Block;
        selectedOverlay?: Graphics;
      };

      if (child.selectedOverlay) {
        child.selectedOverlay.visible = !!id && child.dataBlock?.id === id;
      }
    }
  }, []);

  const indices = useMemo(() => {
    if (game.paletteIndices && game.paletteIndices.length > 0)
      return game.paletteIndices;
    return Object.keys(PALETTE)
      .map((k) => Number(k))
      .filter((i) => i !== 0);
  }, [game.paletteIndices]);

  const area = useMemo(
    () => getBlocksArea(game.currentLevel, 8),
    [game.currentLevel]
  );

  const blocks = useMemo(() => {
    void refreshKey; // ensure dependency is considered used
    return blocksProp
      ? blocksProp
      : generateBlocks(game.currentLevel, count, indices, area.cols);
  }, [blocksProp, game.currentLevel, count, indices, area.cols, refreshKey]);

  // keep latest blocks in a ref for handlers initialized once
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  // init Pixi
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let mounted = true;
    renderBlocksTo(container, {
      blocks: blocksRef.current,
      area,
      palette: PALETTE,
      cellSize,
      gap: 2,
      background,
      freeLayout: true,
      randomRotation: true,
    }).then(({ destroy, app, redraw }) => {
      if (!mounted) {
        destroy();
        return;
      }
      ctxRef.current = { destroy, app, redraw };

      const attach = () => {
        const stage: Container = app.stage as Container;
        stage.eventMode = "static";
        initChildren(blocksRef.current, cellSize);
      };
      attach();

      (ctxRef.current as BlocksCtx).cleanup = () => destroy();
    });
    return () => {
      mounted = false;
      if (ctxRef.current) {
        ctxRef.current.cleanup?.();
        ctxRef.current = null;
      }
    };
  }, [area, cellSize, background, updateSelectionOverlay]);

  const initChildren = useCallback((blocks: Block[], cellSize: number) => {
    if (!ctxRef.current) {
      return;
    }
    const stage: Container = ctxRef.current.app.stage as Container;
    for (let i = 0; i < stage.children.length; i += 1) {
      const child = stage.children[i] as (Graphics | Container) & {
        dataBlock?: Block;
        hoverOverlay?: Graphics;
        selectedOverlay?: Graphics;
        removeAllListeners?: (event?: string) => void;
      };
      child.eventMode = "static";
      child.cursor = "pointer";
      child.removeAllListeners?.("pointerdown");
      child.removeAllListeners?.("pointerover");
      child.removeAllListeners?.("pointerout");
      child.on("pointerover", () => {
        if (child.hoverOverlay) child.hoverOverlay.visible = true;
      });
      child.on("pointerout", () => {
        if (child.hoverOverlay) child.hoverOverlay.visible = false;
      });
      child.on("pointerdown", () => {
        const blk = child.dataBlock;
        if (blk) {
          setSelectedId(blk.id);
          updateSelectionOverlay(blk.id);
          game.pick(blk);
          return;
        }
        const col = Math.round(child.x / cellSize);
        const row = Math.round(child.y / cellSize);
        const found = blocks.find((b) => b.col === col && b.row === row);
        if (found) {
          setSelectedId(found.id);
          updateSelectionOverlay(found.id);
          game.pick(found);
        }
      });
    }
  }, []);

  // re-attach handlers for any newly added children
  useEffect(() => {
    if (!ctxRef.current) {
      return;
    }

    ctxRef.current.redraw(blocks);
    initChildren(blocks, cellSize);
    updateSelectionOverlay(selectedId);
  }, [
    blocks,
    cellSize,
    game,
    updateSelectionOverlay,
    selectedId,
    initChildren,
  ]);

  // keep selection valid when blocks set changes
  useEffect(() => {
    if (!selectedId) {
      return;
    }

    if (!blocks.some((b) => b.id === selectedId)) {
      setSelectedId(null);
      updateSelectionOverlay(null);
    }
  }, [blocks, selectedId, updateSelectionOverlay]);

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            if (blocksProp) {
              game.refreshBlocks();
            } else {
              setRefreshKey((k) => k + 1);
              game.incrementRefreshes();
            }
          }}
          className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Refresh blocks
        </button>
        <span className="text-xs opacity-70">Refreshes: {game.refreshes}</span>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
