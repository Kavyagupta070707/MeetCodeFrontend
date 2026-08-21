import { Clock, Code2, Loader, LogIn, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getDifficultyBadgeClass } from "../lib/utils";

function ActiveSessions({ sessions, isLoading, onRejoinSession }) {
  if (!isLoading && sessions.length === 0) return null;

  return (
    <div className="rounded-lg bg-base-100 border border-base-300">
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-lg bg-success/10 text-success flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Active Sessions</h2>
              <p className="text-sm text-base-content/60 mt-1">
                Rejoin private rooms that are still running.
              </p>
            </div>
          </div>
          <span className="badge badge-success">{sessions.length} active</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className="rounded-lg border border-success/25 bg-success/10 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-success/15 text-success flex shrink-0 items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-lg truncate">{session.problemTitle}</h3>
                        <span
                          className={`badge badge-sm ${getDifficultyBadgeClass(
                            session.difficulty
                          )}`}
                        >
                          {session.difficulty}
                        </span>
                        <span className="badge badge-success gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          ACTIVE
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/65">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          Created{" "}
                          {formatDistanceToNow(new Date(session.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {session.participant ? "2" : "1"} participant
                          {session.participant ? "s" : ""}
                        </span>
                        {session.sessionCode && (
                          <span className="font-mono text-primary">{session.sessionCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary rounded-lg gap-2 md:shrink-0"
                    onClick={() => onRejoinSession(session._id)}
                  >
                    <LogIn className="w-4 h-4" />
                    Rejoin
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ActiveSessions;
