import { useEffect, useMemo, useRef } from "react";
import type { LevelData } from "../levels";
import { PALETTE } from "../levels";
import {
  renderLevelTo,
  type LevelRenderContext,
} from "../renderer/pixiRenderer";
import { Graphics } from "pixi.js";
import { canPlaceBlock } from "../game/board";
import { useGame } from "../game/context";

type Props = {
  level?: LevelData;
  cellSize?: number;
  gap?: number;
  background?: string;
  className?: string;
  preview?: {
    length: number;
    orientation: "h" | "v";
    colorIndex: number;
  } | null;
  interactive?: boolean;
  showPlacements?: boolean;
};

export default function LevelView({
  level,
  cellSize = 32,
  gap = 1,
  background = "#ffffff",
  className,
  preview = null,
  interactive = true,
  showPlacements = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Graphics | null>(null);
  const ctxRef = useRef<LevelRenderContext | null>(null);
  const game = useGame();
  const activeLevel = useMemo<LevelData>(
    () => level ?? game.board,
    [level, game.board]
  );

  const ctxLevelRef = useRef<LevelData>(activeLevel);
  const previewRef = useRef<Props["preview"]>(preview);
  const placedRef = useRef(game.placed);
  const dropRef = useRef(game.drop);
  const pickFromBoardRef = useRef(game.pickFromBoard);

  // Pixi init
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | undefined;
    let mounted = true;

    renderLevelTo(container, {
      level: ctxLevelRef.current,
      palette: PALETTE,
      cellSize,
      gap,
      background,
      placed: showPlacements ? placedRef.current : undefined,
    }).then((ctx) => {
      if (!mounted) {
        ctx.destroy();
        return;
      }
      ctxRef.current = ctx;
      cleanup = ctx.destroy;

      if (interactive) {
        const g = new Graphics();
        overlayRef.current = g;
        ctx.app.stage.addChild(g);

        const canvas = ctx.app.canvas as HTMLCanvasElement;
        const handleMove = (e: MouseEvent) => {
          if (!previewRef.current) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const { row, col } = ctx.pointToCell(x, y);
          const can = canPlaceBlock(
            ctxLevelRef.current,
            row,
            col,
            previewRef.current.length,
            previewRef.current.orientation
          );
          const cs = ctx.cellSize;
          const w =
            previewRef.current.orientation === "h"
              ? previewRef.current.length * cs
              : cs;
          const h =
            previewRef.current.orientation === "v"
              ? previewRef.current.length * cs
              : cs;
          g.clear();
          g.rect(col * cs, row * cs, w, h).fill(can ? 0x00ff00 : 0xff0000, 0.3);
        };
        const handleLeave = () => {
          g.clear();
        };
        const handleClick = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const { row, col } = ctx.pointToCell(x, y);
          if (previewRef.current) {
            const can = canPlaceBlock(
              ctxLevelRef.current,
              row,
              col,
              previewRef.current.length,
              previewRef.current.orientation
            );
            if (can) dropRef.current(row, col);
          } else {
            pickFromBoardRef.current(row, col);
          }
        };
        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("mouseleave", handleLeave);
        canvas.addEventListener("click", handleClick);
        const removeEvents = () => {
          canvas.removeEventListener("mousemove", handleMove);
          canvas.removeEventListener("mouseleave", handleLeave);
          canvas.removeEventListener("click", handleClick);
        };
        const prevCleanup = cleanup;
        cleanup = () => {
          removeEvents();
          g.destroy();
          prevCleanup?.();
        };
      }
    });

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [cellSize, gap, background, interactive, showPlacements]);

  useEffect(() => {
    ctxLevelRef.current = activeLevel;
    if (ctxRef.current) {
      ctxRef.current.redraw(
        ctxLevelRef.current,
        showPlacements ? placedRef.current : undefined
      );
    }
  }, [activeLevel, showPlacements]);

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  useEffect(() => {
    placedRef.current = game.placed;
    if (ctxRef.current) {
      ctxRef.current.redraw(
        ctxLevelRef.current,
        showPlacements ? placedRef.current : undefined
      );
    }
  }, [game.placed, showPlacements]);

  useEffect(() => {
    dropRef.current = game.drop;
    pickFromBoardRef.current = game.pickFromBoard;
  }, [game.drop, game.pickFromBoard]);

  return <div ref={containerRef} className={className} />;
}
