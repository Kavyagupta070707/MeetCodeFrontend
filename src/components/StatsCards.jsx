import { Link } from "react-router";
import { ArrowRightIcon, StarIcon, SwordsIcon } from "lucide-react";

function getRatingTier(rating) {
  if (rating >= 1400) return { name: "Champion", floor: 1400, next: null };
  if (rating >= 1200) return { name: "Duelist", floor: 1200, next: 1400 };
  if (rating >= 1100) return { name: "Problem Solver", floor: 1100, next: 1200 };
  if (rating >= 1000) return { name: "Rising Coder", floor: 1000, next: 1100 };
  return { name: "Rookie", floor: 0, next: 1000 };
}

function StatsCards({ rating }) {
  const tier = getRatingTier(rating);
  const progress = tier.next
    ? Math.min(100, Math.max(0, ((rating - tier.floor) / (tier.next - tier.floor)) * 100))
    : 100;

  return (
    <div className="rounded-lg bg-base-100 border border-base-300 p-6 h-full">
      <div className="flex items-center justify-between gap-3">
        <div className="size-12 rounded-lg flex items-center justify-center text-accent bg-accent/10">
          <StarIcon className="size-6" />
        </div>
        <span className="badge badge-ghost">1v1</span>
      </div>
      <div className="mt-7 text-4xl font-black text-base-content">{rating}</div>
      <div className="mt-1 text-sm text-base-content/60">Rating</div>

      <div className="mt-6 rounded-lg bg-base-200/70 border border-base-300 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-base-content/60">Rank</p>
            <p className="font-bold text-base-content">{tier.name}</p>
          </div>
          <span className="text-xs text-base-content/50">
            {tier.next ? `${tier.next - rating} pts left` : "Top tier"}
          </span>
        </div>
        <progress className="progress progress-primary w-full mt-4" value={progress} max="100" />
      </div>

      <Link to="/one-v-one" className="btn btn-primary w-full mt-5 rounded-lg gap-2">
        <SwordsIcon className="size-4" />
        Play 1v1
        <ArrowRightIcon className="size-4" />
      </Link>
    </div>
  );
}

export default StatsCards;
