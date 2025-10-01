import { useCallback, useState } from "react";
import BlocksView from "./components/BlocksView";
import LevelView from "./components/LevelView";
import ReferenceLevelView from "./components/ReferenceLevelView";
import { useGame } from "./game/context";
import { levels } from "./levels";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

function App() {
  const game = useGame();
  const [showHowTo, setShowHowTo] = useState(false);
  const handleLevelChange = useCallback(
    (idx: number) => {
      game.changeLevel(idx);
    },
    [game]
  );
  const handleReplay = useCallback(() => {
    game.changeLevel(game.levelIndex);
  }, [game]);
  const handleNext = useCallback(() => {
    const next = (game.levelIndex + 1) % levels.length;
    game.changeLevel(next);
  }, [game]);

  return (
    <>
      <h1 className="mb-6 text-4xl font-bold">Lego Mini Game</h1>
      <div className="mb-8 inline-flex items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <label
          htmlFor="levelSelect"
          className="text-sm font-medium text-slate-700"
        >
          Level:
        </label>
        <select
          id="levelSelect"
          value={game.levelIndex}
          onChange={(e) => handleLevelChange(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {levels.map(({ name }, idx) => (
            <option value={idx} key={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="ml-4 text-sm font-medium text-slate-700">
          Time: {formatDuration(game.levelElapsedMs)}
        </div>
        <div className="ml-4">
          <button
            onClick={() => setShowHowTo(true)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            How To
          </button>
        </div>
      </div>
      <div className="flex items-start justify-center gap-6">
        <div className="rounded-lg bg-lego-black/10 p-2">
          <ReferenceLevelView cellSize={24} />
          <div className="h-4" />
          <div className="text-xs opacity-70">Reference</div>
        </div>
        <div className="rounded-lg bg-lego-black/10 p-2">
          <LevelView
            cellSize={32}
            gap={0}
            preview={
              game.held
                ? {
                    length: game.held.length,
                    orientation: "h",
                    colorIndex: game.held.colorIndex,
                  }
                : null
            }
          />
          <div className="h-4" />
          <div className="text-xs opacity-70">Level</div>
        </div>
        <div className="rounded-lg bg-lego-black/10 p-2">
          <BlocksView cellSize={32} blocks={game.blocks} />
          <div className="h-4" />
          <div className="text-xs opacity-70">Blocks</div>
        </div>
      </div>

      {showHowTo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowHowTo(false)}
        >
          <div
            className="w-[420px] max-w-[90vw] rounded-lg border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              How to play
            </h2>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                Build the pattern shown in{" "}
                <span className="font-medium">Reference</span> on the
                <span className="font-medium"> Level</span> grid using blocks
                from <span className="font-medium">Blocks</span>.
              </p>
              <ol className="list-decimal space-y-2 pl-5 text-left">
                <li>Click a block in Blocks to pick it up.</li>
                <li>
                  Move your cursor over the Level grid to preview placement.
                </li>
                <li>Click on the grid to place the block if it fits.</li>
                <li>
                  Click placed blocks on the Level grid to remove them back to
                  Blocks.
                </li>
              </ol>
              <p className="text-slate-600">
                Tip: Use "Refresh blocks" to get a new set if you run out of
                options.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowHowTo(false)}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {game.isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[360px] rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              You win! 🎉
            </h2>
            <p className="mb-4 text-slate-700">
              Great job completing the level.
            </p>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-slate-500">Time</div>
                <div className="text-lg font-semibold text-slate-900">
                  {formatDuration(game.levelElapsedMs)}
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3">
                <div className="text-slate-500">Refreshes</div>
                <div className="text-lg font-semibold text-slate-900">
                  {game.refreshes}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleReplay}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Replay
              </button>
              <button
                onClick={handleNext}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Next level
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
