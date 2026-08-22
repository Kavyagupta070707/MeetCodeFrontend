import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
  FlagIcon,
  Loader2Icon,
  LogOutIcon,
  SwordsIcon,
  TimerIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Navbar from "../components/Navbar.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import OutputPanel from "../components/OutputPanel.jsx";
import { PROBLEMS } from "../data/problems.js";
import { executeCode } from "../lib/piston.js";
import { getDifficultyBadgeClass } from "../lib/utils.js";
import {
  useLeaveOneVOneSession,
  useOneVOneSession,
  useSubmitOneVOneWin,
} from "../hooks/useOneVOne.js";

function normalizeOutput(output) {
  return (output || "")
    .trim()
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/\[\s+/g, "[")
        .replace(/\s+\]/g, "]")
        .replace(/\s*,\s*/g, ",")
    )
    .filter((line) => line.length > 0)
    .join("\n");
}

function formatTime(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds} second${seconds === 1 ? "" : "s"}`;

  return `${minutes} minute${minutes === 1 ? "" : "s"} ${seconds} second${
    seconds === 1 ? "" : "s"
  }`;
}

function getPlayerImage(player) {
  return player?.profileimage || player?.profileImage || "";
}

function getPlayerInitials(player, fallback) {
  const name = player?.name || fallback;
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function FaceoffPlayerCard({ player, label }) {
  const playerName = player?.name || label;
  const playerImage = getPlayerImage(player);

  return (
    <div className="rounded-lg border border-base-300 bg-base-200/70 p-6 text-center">
      <div className="mx-auto mb-4 size-24 overflow-hidden rounded-full border-2 border-primary/40 bg-base-100">
        {playerImage ? (
          <img src={playerImage} alt={playerName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-primary">
            {getPlayerInitials(player, label)}
          </div>
        )}
      </div>
      <p className="text-xs font-bold uppercase text-base-content/50">{label}</p>
      <h3 className="mt-1 truncate text-2xl font-black text-base-content">{playerName}</h3>
      <div className="mt-4 rounded-lg bg-base-100 px-4 py-3">
        <p className="text-xs text-base-content/50">Rating</p>
        <p className="text-2xl font-black text-primary">{player?.rating ?? 1000}</p>
      </div>
    </div>
  );
}

function OneVOneSessionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [now, setNow] = useState(() => Date.now());
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [codeByStarterKey, setCodeByStarterKey] = useState({});
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const {
    data: sessionData,
    isLoading,
    error,
    refetch,
  } = useOneVOneSession(id);
  const submitWin = useSubmitOneVOneWin();
  const leaveSession = useLeaveOneVOneSession();

  const session = sessionData?.session;
  const problemData = useMemo(
    () => Object.values(PROBLEMS).find((problem) => problem.title === session?.problemTitle),
    [session?.problemTitle]
  );
  const isMatchActive = session?.status === "active";
  const isCompleted = session?.status === "completed";
  const isWaiting = session?.status === "waiting";
  const startedAtMs = session?.startedAt ? new Date(session.startedAt).getTime() : 0;
  const endsAtMs = session?.endsAt ? new Date(session.endsAt).getTime() : 0;
  const countdownMs = isMatchActive && startedAtMs ? Math.max(0, startedAtMs - now) : 0;
  const isCountdownActive = countdownMs > 0;
  const countdownValue = Math.max(1, Math.min(5, Math.ceil(countdownMs / 1000)));
  const timerBase = isCountdownActive && startedAtMs ? startedAtMs : now;
  const remainingMs = isMatchActive && endsAtMs ? endsAtMs - timerBase : 0;
  const canRunCode =
    isMatchActive && !isCountdownActive && remainingMs > 0 && !submitWin.isPending;
  const currentUserWon = session?.winner?.clerkId === user?.id;
  const currentUserLost = session?.loser?.clerkId === user?.id;
  const wasForfeit = session?.resultReason === "forfeit";
  const currentPlayer =
    session?.host?.clerkId === user?.id ? session?.host : session?.participant;
  const resultRating = currentUserWon
    ? session?.winner?.rating
    : currentUserLost
      ? session?.loser?.rating
      : currentPlayer?.rating;
  const starterKey = `${session?.problemTitle || ""}:${selectedLanguage}`;
  const starterCode = problemData?.starterCode?.[selectedLanguage] || "";
  const code = codeByStarterKey[starterKey] ?? starterCode;
  const solvedDuration =
    session?.startedAt && session?.completedAt
      ? new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()
      : 0;

  useEffect(() => {
    if (!isMatchActive) return;

    const timeoutId = setTimeout(() => setNow(Date.now()), 0);
    const intervalId = setInterval(() => setNow(Date.now()), 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isMatchActive]);

  useEffect(() => {
    if (!isMatchActive || remainingMs > 0) return;

    refetch();
  }, [isMatchActive, remainingMs, refetch]);

  const handleLanguageChange = (event) => {
    const nextLanguage = event.target.value;

    setSelectedLanguage(nextLanguage);
    setOutput(null);
  };

  const handleRunCode = async () => {
    if (!canRunCode) return;

    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    const expectedOutput = problemData?.expectedOutput?.[selectedLanguage];

    if (!result.success || !expectedOutput) return;

    if (normalizeOutput(result.output) !== normalizeOutput(expectedOutput)) {
      toast.error("Output does not match all expected test cases yet");
      return;
    }

    submitWin.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  const handleLeaveWaitingMatch = () => {
    leaveSession.mutate(id, {
      onSuccess: () => navigate("/one-v-one"),
    });
  };

  const handleForfeitMatch = () => {
    if (!confirm("Forfeit this 1v1 match? This will count as a loss.")) return;

    leaveSession.mutate(id, {
      onSuccess: () => refetch(),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader2Icon className="size-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="container mx-auto px-6 py-16">
          <div className="card bg-base-100 border-2 border-error/20 max-w-xl mx-auto">
            <div className="card-body items-center text-center">
              <h1 className="text-2xl font-black">Match not available</h1>
              <p className="text-base-content/70">This 1v1 session could not be opened.</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate("/one-v-one")}>
                Find Match
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="container mx-auto px-6 py-16">
          <div className="card bg-base-100 border-2 border-primary/20 max-w-2xl mx-auto">
            <div className="card-body items-center text-center">
              <div className="p-4 bg-primary/10 rounded-3xl">
                <Loader2Icon className="size-12 animate-spin text-primary" />
              </div>
              <h1 className="text-3xl font-black mt-4">Waiting for opponent</h1>
              <p className="text-base-content/70">
                Your {session.difficulty} match is ready. The timer starts when another user joins.
              </p>
              <div className="stats bg-base-200 mt-6">
                <div className="stat">
                  <div className="stat-title">Difficulty</div>
                  <div className="stat-value capitalize text-2xl">{session.difficulty}</div>
                </div>
                <div className="stat">
                  <div className="stat-title">Players</div>
                  <div className="stat-value text-2xl">1/2</div>
                </div>
              </div>
              <button
                className="btn btn-outline btn-error mt-6 gap-2"
                onClick={handleLeaveWaitingMatch}
                disabled={leaveSession.isPending}
              >
                {leaveSession.isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <LogOutIcon className="size-4" />
                )}
                Leave Match
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!problemData) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="container mx-auto px-6 py-16">
          <div className="alert alert-error max-w-xl mx-auto">
            Problem data for this match is missing from the frontend.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="px-4 py-3 bg-base-100 border-b border-base-300 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <SwordsIcon className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-bold">One vs One</p>
            <p className="text-xs text-base-content/60">
              {session.host?.name || "Player 1"} vs {session.participant?.name || "Player 2"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>
            {session.difficulty}
          </span>
          <div className="badge badge-outline gap-2 h-9 px-4">
            <UsersIcon className="size-4" />
            2/2
          </div>
          <div className="badge badge-primary gap-2 h-9 px-4 font-mono text-base">
            <TimerIcon className="size-4" />
            {isCompleted ? "00:00" : formatTime(remainingMs)}
          </div>
          {isMatchActive && (
            <button
              className="btn btn-error btn-sm gap-2"
              onClick={handleForfeitMatch}
              disabled={leaveSession.isPending}
            >
              {leaveSession.isPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <FlagIcon className="size-4" />
              )}
              Forfeit
            </button>
          )}
        </div>
      </div>

      {isCountdownActive && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-base-300/95 px-6 backdrop-blur-md">
          <div className="w-full max-w-5xl rounded-lg border border-primary/30 bg-base-100 p-8 shadow-2xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase text-primary">Match Found</p>
              <h2 className="mt-2 text-3xl font-black text-base-content">{session.problemTitle}</h2>
            </div>

            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <FaceoffPlayerCard player={session.host} label="Player 1" />

              <div className="flex flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-8 py-6">
                <p className="text-sm font-bold uppercase text-base-content/60">
                  Starts in
                </p>
                <div className="my-3 flex size-24 items-center justify-center rounded-full bg-base-100 text-6xl font-black text-primary shadow-lg">
                  {countdownValue}
                </div>
                <p className="text-2xl font-black text-base-content">VS</p>
              </div>

              <FaceoffPlayerCard player={session.participant} label="Player 2" />
            </div>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="fixed inset-0 z-[80] bg-base-300/95 backdrop-blur-md flex items-center justify-center px-6">
          <div
            className={`card max-w-xl w-full border-2 shadow-2xl ${
              session.result === "draw"
                ? "bg-warning/10 border-warning/40"
                : currentUserWon
                  ? "bg-success/10 border-success/40"
                  : "bg-error/10 border-error/40"
            }`}
          >
            <div className="card-body items-center text-center p-10">
              <div
                className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-2 ${
                  session.result === "draw"
                    ? "bg-warning/20"
                    : currentUserWon
                      ? "bg-success/20"
                      : "bg-error/20"
                }`}
              >
                <TrophyIcon
                  className={`size-12 ${
                    session.result === "draw"
                      ? "text-warning"
                      : currentUserWon
                        ? "text-success"
                        : "text-error"
                  }`}
                />
              </div>

              <h2 className="text-4xl font-black">
                {session.result === "draw"
                  ? "Match Draw"
                  : currentUserWon
                    ? "You Won"
                    : "You Lost"}
              </h2>

              <p className="text-lg text-base-content/75 mt-2">
                {session.result === "draw"
                  ? `Time is over for ${session.problemTitle}.`
                  : currentUserWon
                    ? wasForfeit
                      ? `${
                          session.loser?.name || "Your opponent"
                        } forfeited. You win this duel.`
                      : `You solved ${session.problemTitle} in ${formatDuration(solvedDuration)}.`
                    : wasForfeit && currentUserLost
                      ? `You forfeited the duel. Better luck next time.`
                      : `${session.winner?.name || "Your opponent"} solved ${
                          session.problemTitle
                        } first. Better luck next time.`}
              </p>

              <div className="stats bg-base-100 shadow mt-6 w-full">
                <div className="stat">
                  <div className="stat-title">Rating Change</div>
                  <div
                    className={`stat-value text-3xl ${
                      currentUserWon
                        ? "text-success"
                        : currentUserLost
                          ? "text-error"
                          : "text-warning"
                    }`}
                  >
                    {currentUserWon ? "+10" : currentUserLost ? "-10" : "0"}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Current Rating</div>
                  <div className="stat-value text-3xl">{resultRating ?? 1000}</div>
                </div>
              </div>

              <button className="btn btn-primary mt-6 w-full" onClick={() => navigate("/one-v-one")}>
                Back to 1v1
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:block flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={45} minSize={30}>
            <div className="h-full min-h-0 overflow-y-auto bg-base-200">
              <div className="p-6 bg-base-100 border-b border-base-300">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-base-content">{problemData.title}</h1>
                    <p className="text-base-content/60 mt-1">{problemData.category}</p>
                  </div>
                  <span className={`badge badge-lg ${getDifficultyBadgeClass(problemData.difficulty)}`}>
                    {problemData.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                  <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                  <div className="space-y-3 text-base leading-relaxed">
                    <p className="text-base-content/90">{problemData.description.text}</p>
                    {problemData.description.notes.map((note, index) => (
                      <p key={index} className="text-base-content/90">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                  <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
                  <div className="space-y-4">
                    {problemData.examples.map((example, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-sm">{index + 1}</span>
                          <p className="font-semibold text-base-content">Example {index + 1}</p>
                        </div>
                        <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                          <div className="flex gap-2">
                            <span className="text-primary font-bold min-w-[70px]">Input:</span>
                            <span>{example.input}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-primary font-bold min-w-[70px]">Output:</span>
                            <span>{example.output}</span>
                          </div>
                          {example.explanation && (
                            <div className="pt-2 border-t border-base-300 mt-2">
                              <span className="text-base-content/60 font-sans text-xs">
                                <span className="font-semibold">Explanation:</span>{" "}
                                {example.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                  <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                  <ul className="space-y-2 text-base-content/90">
                    {problemData.constraints.map((constraint, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <code className="text-sm">{constraint}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          <Panel defaultSize={55} minSize={35}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={35}>
                <CodeEditor
                  language={selectedLanguage}
                  code={code}
                  isrunning={isRunning || submitWin.isPending}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={(value) =>
                    setCodeByStarterKey((previousCode) => ({
                      ...previousCode,
                      [starterKey]: value || "",
                    }))
                  }
                  onRunCode={handleRunCode}
                  disabled={!canRunCode && !isRunning}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={30} minSize={15}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      <div className="lg:hidden flex-1 overflow-y-auto bg-base-200">
        <div className="p-4 bg-base-100 border-b border-base-300">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-base-content">{problemData.title}</h1>
              <p className="text-sm text-base-content/60 mt-1">{problemData.category}</p>
            </div>
            <span className={`badge ${getDifficultyBadgeClass(problemData.difficulty)}`}>
              {problemData.difficulty}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
            <div className="space-y-3 text-base leading-relaxed">
              <p className="text-base-content/90">{problemData.description.text}</p>
              {problemData.description.notes.map((note, index) => (
                <p key={index} className="text-base-content/90">
                  {note}
                </p>
              ))}
            </div>
          </div>

          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
            <div className="space-y-4">
              {problemData.examples.map((example, index) => (
                <div key={index}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-sm">{index + 1}</span>
                    <p className="font-semibold text-base-content">Example {index + 1}</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                    <div className="flex gap-2">
                      <span className="text-primary font-bold min-w-[70px]">Input:</span>
                      <span>{example.input}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-primary font-bold min-w-[70px]">Output:</span>
                      <span>{example.output}</span>
                    </div>
                    {example.explanation && (
                      <div className="pt-2 border-t border-base-300 mt-2">
                        <span className="text-base-content/60 font-sans text-xs">
                          <span className="font-semibold">Explanation:</span> {example.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
            <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
            <ul className="space-y-2 text-base-content/90">
              {problemData.constraints.map((constraint, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <code className="text-sm">{constraint}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-[520px] border-t border-base-300">
          <CodeEditor
            language={selectedLanguage}
            code={code}
            isrunning={isRunning || submitWin.isPending}
            onLanguageChange={handleLanguageChange}
            onCodeChange={(value) =>
              setCodeByStarterKey((previousCode) => ({
                ...previousCode,
                [starterKey]: value || "",
              }))
            }
            onRunCode={handleRunCode}
            disabled={!canRunCode && !isRunning}
          />
        </div>

        <div className="h-80 border-t border-base-300">
          <OutputPanel output={output} />
        </div>
      </div>
    </div>
  );
}

export default OneVOneSessionPage;
