import { useGame } from "../game/context";
import LevelView from "./LevelView";

type Props = {
  cellSize?: number;
  background?: string;
  className?: string;
  gap?: never;
};

export default function ReferenceLevelView({
  cellSize = 32,
  background = "#ffffff",
  className,
}: Props) {
  const { currentLevel } = useGame();
  return (
    <LevelView
      level={currentLevel}
      cellSize={cellSize}
      gap={0}
      background={background}
      className={className}
      interactive={false}
      showPlacements={false}
    />
  );
}
