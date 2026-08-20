import { TrendingUpIcon } from "lucide-react";

function buildChartPoints(history, currentRating) {
  const rating = currentRating ?? 1000;
  const normalizedHistory = history?.length > 0 ? history : [];
  const shouldBackfillBaseline =
    rating !== 1000 &&
    normalizedHistory.length === 1 &&
    normalizedHistory[0]?.rating === rating &&
    normalizedHistory[0]?.reason === "initial";
  const chartHistory =
    normalizedHistory.length === 0
      ? [
          {
            rating: 1000,
            change: 0,
            reason: "initial",
            createdAt: new Date().toISOString(),
          },
          ...(rating !== 1000
            ? [
                {
                  rating,
                  change: rating - 1000,
                  reason: rating > 1000 ? "win" : "loss",
                  createdAt: new Date().toISOString(),
                },
              ]
            : []),
        ]
      : shouldBackfillBaseline
        ? [
            {
              rating: 1000,
              change: 0,
              reason: "initial",
              createdAt: normalizedHistory[0]?.createdAt,
            },
            normalizedHistory[0],
          ]
        : normalizedHistory;

  const points = chartHistory.map((entry) => ({
      rating: entry.rating,
      change: entry.change,
      reason: entry.reason,
      createdAt: entry.createdAt,
    }));

  if (points.length > 0 && points[0].rating !== 1000) {
    if (points[0].reason === "initial") {
      points[0] = {
        ...points[0],
        rating: 1000,
        change: 0,
      };
    } else {
      points.unshift({
        rating: 1000,
        change: 0,
        reason: "initial",
        createdAt: points[0].createdAt,
      });
    }
  }

  if (points.length <= 12) return points;

  return [points[0], ...points.slice(-11)];
}

function RatingHistoryChart({ user }) {
  const points = buildChartPoints(user?.ratingHistory, user?.rating);
  const hasTrend = points.length >= 2;
  const ratings = points.map((point) => point.rating);
  const rawMinRating = Math.min(...ratings, 1000);
  const rawMaxRating = Math.max(...ratings, 1000);
  const minRating = Math.floor((rawMinRating - 10) / 10) * 10;
  const maxRating = Math.ceil((rawMaxRating + 10) / 10) * 10;
  const range = Math.max(20, maxRating - minRating);
  const width = 900;
  const height = 300;
  const chartLeft = 58;
  const chartRight = width - 26;
  const chartTop = 28;
  const chartBottom = height - 54;
  const chartWidth = chartRight - chartLeft;
  const chartHeight = chartBottom - chartTop;
  const yTicks = [];
  for (let tick = maxRating; tick >= minRating; tick -= 10) {
    yTicks.push(tick);
  }

  const coordinates = points.map((point, index) => {
    const x =
      points.length === 1 ? chartLeft : chartLeft + (index / (points.length - 1)) * chartWidth;
    const y = chartTop + ((maxRating - point.rating) / range) * chartHeight;

    return { ...point, x, y };
  });

  const path = coordinates
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${path} L ${coordinates[coordinates.length - 1]?.x} ${chartBottom} L ${
    coordinates[0]?.x
  } ${chartBottom} Z`;
  const latestPoint = points[points.length - 1];
  const previousPoint = points[points.length - 2];
  const ratingDelta = previousPoint ? latestPoint.rating - previousPoint.rating : 0;
  const trendClass = ratingDelta >= 0 ? "stroke-success" : "stroke-error";
  const trendAreaClass = ratingDelta >= 0 ? "fill-success" : "fill-error";

  return (
    <div className="rounded-lg bg-base-100 border border-base-300 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUpIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Rating History</h2>
            <p className="text-sm text-base-content/60 mt-1">Your recent 1v1 rating movement.</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-base-content/60">Current rating</p>
          <p className="text-3xl font-black text-primary">{user?.rating ?? 1000}</p>
          <p
            className={`text-sm font-semibold ${
              ratingDelta > 0
                ? "text-success"
                : ratingDelta < 0
                  ? "text-error"
                  : "text-base-content/50"
            }`}
          >
            {ratingDelta > 0 ? `+${ratingDelta}` : ratingDelta} latest
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-base-200/60 border border-base-300 p-4 overflow-hidden">
        {hasTrend ? (
          <>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72" role="img">
              {yTicks.map((tick) => {
                const y = chartTop + ((maxRating - tick) / range) * chartHeight;

                return (
                  <g key={tick}>
                    <line
                      x1={chartLeft}
                      y1={y}
                      x2={chartRight}
                      y2={y}
                      className="stroke-base-content/10"
                      strokeWidth="1"
                    />
                    <text
                      x={chartLeft - 12}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      className="fill-current text-base-content/55"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}
              <line
                x1={chartLeft}
                y1={chartTop}
                x2={chartLeft}
                y2={chartBottom}
                className="stroke-base-content/20"
                strokeWidth="1.5"
              />
              <line
                x1={chartLeft}
                y1={chartBottom}
                x2={chartRight}
                y2={chartBottom}
                className="stroke-base-content/20"
                strokeWidth="1.5"
              />
              <path d={areaPath} className={`${trendAreaClass} opacity-10`} />
              <path
                d={path}
                fill="none"
                className={trendClass}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {coordinates.map((point, index) => (
                <g key={`${point.createdAt}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    className={`fill-base-100 ${trendClass}`}
                    strokeWidth="3"
                  />
                  <text
                    x={point.x}
                    y={point.y - 14}
                    textAnchor="middle"
                    fontSize="12"
                    className="fill-current text-base-content/80 font-semibold"
                  >
                    {point.rating}
                  </text>
                  <text
                    x={point.x}
                    y={chartBottom + 24}
                    textAnchor="middle"
                    fontSize="12"
                    className="fill-current text-base-content/55"
                  >
                    {index === 0 ? "Start" : `M${index}`}
                  </text>
                </g>
              ))}
            </svg>
          </>
        ) : (
          <div className="min-h-56 flex flex-col items-center justify-center text-center">
            <p className="text-xl font-bold text-base-content">No rating trend yet</p>
            <p className="text-sm text-base-content/60 mt-2 max-w-md">
              Play more rated 1v1 matches and your rating movement will appear here.
            </p>
            <div className="stats bg-base-100 border border-base-300 mt-6">
              <div className="stat">
                <div className="stat-title">Starting Rating</div>
                <div className="stat-value text-3xl">{user?.rating ?? 1000}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RatingHistoryChart;
