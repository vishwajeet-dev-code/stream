
import "./AnimatedBackground.css";

export default function AnimatedBackground() {
  const waves = [
    { d: "M -100 180 C 180 40, 300 380, 550 230 S 900 80, 1200 160", color: "#ff2638", width: 2.2 },
    { d: "M -100 240 C 200 100, 300 420, 570 270 S 900 130, 1200 220", color: "#ffffff", width: 0.8 },
    { d: "M -100 350 C 160 500, 350 150, 580 300 S 900 400, 1200 280", color: "#ff2638", width: 1.8 },
    { d: "M -100 390 C 170 540, 350 190, 580 340 S 920 440, 1200 320", color: "#ffffff", width: 0.9 },
    { d: "M -100 580 C 180 420, 360 750, 620 590 S 950 460, 1200 650", color: "#ff2638", width: 2 },
    { d: "M -100 610 C 180 450, 360 780, 620 620 S 950 490, 1200 680", color: "#ffffff", width: 0.9 },
  ];

  return (
    <div className="animated-background">
      <div className="background-glow" />

      <svg
        className="wave-svg"
        viewBox="0 0 1100 750"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="red-light">
            <stop offset="0%" stopColor="#ff2638" stopOpacity="0" />
            <stop offset="50%" stopColor="#ff2638" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff2638" stopOpacity="0" />
          </linearGradient>
        </defs>

        {waves.map((wave, index) => (
          <g key={index}>
            <path
              d={wave.d}
              fill="none"
              stroke={wave.color}
              strokeWidth={wave.width}
              opacity="0.15"
              transform={`translate(0 ${index * 2})`}
            />

            <path
              d={wave.d}
              fill="none"
              stroke={wave.color}
              strokeWidth={wave.width}
              className={
                wave.color === "#ff2638"
                  ? `wave wave-red wave-${index}`
                  : `wave wave-white wave-${index}`
              }
              filter={wave.color === "#ff2638" ? "url(#neon-glow)" : undefined}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>

      <div className="background-vignette" />
    </div>
  );
}
