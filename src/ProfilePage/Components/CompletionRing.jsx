export const CompletionRing = ({ percentage = 0, size = 40, stroke = 3 }) => {
    const color =
        percentage >= 100
            ? "#22c55e"
            : percentage >= 70
            ? "#fbbf24"
            : "#ef4444";

    const radius = (size - stroke) / 2;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (percentage / 100) * circ;

    return (
        <div className="flex flex-col ml-2 gap-1 h-full w-full justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s" }}
                />
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14px"
                    fontWeight={600}
                    fill="currentColor"
                    className="text-slate-700 dark:text-amber-50"
                >
                    {percentage}%
                </text>
            </svg>
        </div>
    );
};
