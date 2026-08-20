import { ArrowRightIcon, HashIcon, LoaderIcon, LockKeyholeIcon } from "lucide-react";

function JoinSession({ sessionCode, setSessionCode, onJoinSession, isJoining }) {
  return (
    <div className="lg:col-span-2 card bg-base-100 border-2 border-primary/20 hover:border-primary/30 h-full">
      <div className="card-body justify-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl">
            <LockKeyholeIcon className="size-5 text-white" />
          </div>
          <h2 className="text-2xl font-black">Join Private Session</h2>
        </div>

        <form className="space-y-5" onSubmit={onJoinSession}>
          <label className="block">
            <span className="label-text font-semibold block mb-2">Session Code</span>
            <div className="relative">
              <HashIcon className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
              <input
                className="input input-bordered w-full h-14 pl-12 uppercase tracking-widest text-lg font-bold"
                value={sessionCode}
                onChange={(event) => setSessionCode(event.target.value.toUpperCase())}
                placeholder="ABC123"
                maxLength={6}
              />
            </div>
          </label>

          <button
            className="btn btn-primary w-full h-12 gap-2"
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
