import { Code2, Clock, Users, Trophy, Loader } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

function RecentSessions({ sessions, isLoading }) {
  return (
    <div className="rounded-lg bg-base-100 border border-base-300">
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Recent Sessions</h2>
              <p className="text-sm text-base-content/60 mt-1">Your completed private rooms.</p>
            </div>
          </div>
          <span className="badge badge-ghost">{sessions.length} total</span>
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[430px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <Loader className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`rounded-lg border relative ${
                  session.status === "active"
                    ? "bg-success/10 border-success/30"
                    : "bg-base-200 border-base-300"
                }`}
              >
                {session.status === "active" && (
                  <div className="absolute top-3 right-3">
                    <div className="badge badge-success gap-1">
                      <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                      ACTIVE
                    </div>
                  </div>
                )}

                <div className="p-3.5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex shrink-0 items-center justify-center ${
                        session.status === "active"
                          ? "bg-success/15 text-success"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base truncate">{session.problemTitle}</h3>
                        <span
                          className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}
                        >
                          {session.difficulty}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/65">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(session.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {session.participant ? "2" : "1"} participant
                          {session.participant ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-base-content/45 shrink-0">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <p className="text-lg font-semibold opacity-70 mb-1">No sessions yet</p>
              <p className="text-sm opacity-50">Start your coding journey today!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentSessions;
