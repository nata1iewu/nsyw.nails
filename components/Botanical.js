// A quiet eucalyptus-style branch, rendered as a stem with distinct alternating
// almond-shaped leaves — kept simple so it reads clearly at small sizes.
export default function Botanical({ className = "", flip = false }) {
  const leaves = [
    { t: [40, 210, 70, 165], side: 1 },
    { t: [70, 165, 100, 130], side: -1 },
    { t: [100, 130, 128, 98], side: 1 },
    { t: [128, 98, 154, 68], side: -1 },
    { t: [154, 68, 178, 40], side: 1 },
  ];

  return (
    <svg
      viewBox="0 0 220 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      {/* main stem */}
      <path
        d="M30 225 C 55 190, 75 175, 95 145 C 118 112, 140 85, 172 30"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {leaves.map(({ t: [x1, y1, x2, y2], side }, i) => {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = (-dy / len) * 16 * side;
        const ny = (dx / len) * 16 * side;
        const tipX = mx + nx;
        const tipY = my + ny;
        const stalkX = mx + nx * 0.25;
        const stalkY = my + ny * 0.25;
        return (
          <g key={i}>
            <path
              d={`M${mx} ${my} L${stalkX} ${stalkY}`}
              stroke="currentColor"
              strokeWidth="0.9"
            />
            <path
              d={`M${stalkX} ${stalkY} Q${mx + nx * 0.6 - ny * 0.18} ${
                my + ny * 0.6 + nx * 0.18
              } ${tipX} ${tipY} Q${mx + nx * 0.6 + ny * 0.18} ${
                my + ny * 0.6 - nx * 0.18
              } ${stalkX} ${stalkY} Z`}
              stroke="currentColor"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
    </svg>
  );
}
