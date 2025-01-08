interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl = ({ speed, onSpeedChange }: SpeedControlProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        Game Speed: {speed}
      </label>
      <input
        type="range"
        min="1"
        max="1000"
        value={speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="speed-slider"
      />
    </div>
  );
};

export default SpeedControl;