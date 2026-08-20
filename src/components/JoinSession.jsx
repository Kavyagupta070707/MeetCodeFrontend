import { ArrowRightIcon, HashIcon, LoaderIcon, LockKeyholeIcon } from "lucide-react";

function JoinSession({ sessionCode, setSessionCode, onJoinSession, isJoining }) {
  return (
    <div className="rounded-lg bg-base-100 border border-base-300 h-full">
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start gap-3 mb-8">
          <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <LockKeyholeIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Join Private Session</h2>
            <p className="text-sm text-base-content/60 mt-1">
              Enter the host's 6-character room code.
            </p>
          </div>
        </div>

        <form className="space-y-5 mt-8" onSubmit={onJoinSession}>
          <label className="block">
            <span className="label-text font-semibold block mb-2">Session Code</span>
            <div className="relative">
              <HashIcon className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
              <input
                className="input input-bordered w-full h-14 pl-12 uppercase tracking-widest text-lg font-bold rounded-lg"
                value={sessionCode}
                onChange={(event) => setSessionCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
              />
            </div>
          </label>

          <button
            className="btn btn-primary w-full h-12 rounded-lg gap-2"
            type="submit"
            disabled={isJoining || sessionCode.trim().length !== 6}
          >
            {isJoining ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <ArrowRightIcon className="size-5" />
            )}
            {isJoining ? "Joining..." : "Join Session"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinSession;
