import { StarIcon, TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount, rating }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      <div className="card bg-base-100 border-2 border-accent/20 hover:border-accent/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <StarIcon className="w-7 h-7 text-accent" />
            </div>
            <div className="badge badge-accent">1v1</div>
          </div>
          <div className="text-4xl font-black mb-1">{rating}</div>
          <div className="text-sm opacity-60">Rating</div>
        </div>
      </div>

      {/* Active Count */}
      <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <UsersIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="badge badge-primary">Live</div>
          </div>
          <div className="text-4xl font-black mb-1">{activeSessionsCount}</div>
          <div className="text-sm opacity-60">Your Active Sessions</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <TrophyIcon className="w-7 h-7 text-secondary" />
            </div>
          </div>
          <div className="text-4xl font-black mb-1">{recentSessionsCount}</div>
          <div className="text-sm opacity-60">Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
