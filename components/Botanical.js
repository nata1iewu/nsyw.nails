// A simple hand-drawn-style eucalyptus branch, rendered in thin line art.
// Used as a quiet corner accent, echoing the brand's existing Instagram templates.
export default function Botanical({ className = "", flip = false }) {
  return (
    <svg
      viewBox="0 0 220 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M10 10 C 60 40, 90 80, 120 140 C 145 190, 160 220, 200 250"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {[
        [30, 22, 55, 10, 60, 35],
        [55, 48, 82, 34, 86, 60],
        [78, 78, 108, 66, 110, 92],
        [100, 108, 132, 98, 132, 124],
        [122, 138, 156, 130, 154, 156],
        [145, 168, 180, 162, 176, 188],
        [168, 198, 202, 194, 196, 218],
      ].map(([x1, y1, cx, cy, x2, y2], i) => (
        <g key={i}>
          <path
            d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`}
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <ellipse
            cx={x2}
            cy={y2}
            rx="9"
            ry="5"
            stroke="currentColor"
            strokeWidth="1"
            transform={`rotate(${30 + i * 6} ${x2} ${y2})`}
          />
        </g>
      ))}
    </svg>
  );
}
