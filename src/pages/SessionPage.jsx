import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { useEndSession, useSessionById } from "../hooks/useSessions";
import { PROBLEMS } from "../data/problems";
import { executeCode } from "../lib/piston";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import { ClipboardIcon, Loader2Icon, LogOutIcon, PhoneOffIcon } from "lucide-react";
import CodeEditor from "../components/CodeEditor.jsx"
import OutputPanel from "../components/OutputPanel";

import useWebRTCCall from "../hooks/useWebRTCCall";
import useCollaborativeCode from "../hooks/useCollaborativeCode";
import VideoCallUI from "../components/VideoCallUI";

const FLOATING_VIDEO_WIDTH = 288;
const FLOATING_VIDEO_HEIGHT = 208;
const FLOATING_VIDEO_MARGIN = 16;

function clampFloatingVideoPosition(position) {
  if (typeof window === "undefined") return position;

  const width = Math.min(FLOATING_VIDEO_WIDTH, window.innerWidth - FLOATING_VIDEO_MARGIN * 2);
  const maxX = Math.max(FLOATING_VIDEO_MARGIN, window.innerWidth - width - FLOATING_VIDEO_MARGIN);
  const maxY = Math.max(
    FLOATING_VIDEO_MARGIN,
    window.innerHeight - FLOATING_VIDEO_HEIGHT - FLOATING_VIDEO_MARGIN
  );

  return {
    x: Math.min(Math.max(position.x, FLOATING_VIDEO_MARGIN), maxX),
    y: Math.min(Math.max(position.y, FLOATING_VIDEO_MARGIN), maxY),
  };
}

function getDefaultFloatingVideoPosition() {
  if (typeof window === "undefined") return { x: FLOATING_VIDEO_MARGIN, y: FLOATING_VIDEO_MARGIN };

  return clampFloatingVideoPosition({
    x: window.innerWidth - FLOATING_VIDEO_WIDTH - FLOATING_VIDEO_MARGIN,
    y: window.innerHeight - FLOATING_VIDEO_HEIGHT - FLOATING_VIDEO_MARGIN,
  });
}

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false
  );
  const [isVideoFullscreen, setIsVideoFullscreen] = useState(false);
  const [floatingVideoPosition, setFloatingVideoPosition] = useState(getDefaultFloatingVideoPosition);
  const floatingVideoDragRef = useRef(null);

  const { data: sessionData, isLoading: loadingSession, error: sessionError } = useSessionById(id);

  const endSessionMutation = useEndSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  const isParticipant = session?.participant?.clerkId === user?.id;

  const {
    localVideoRef,
    remoteVideoRef,
    isInitializingCall,
    isConnected,
    isMicOn,
    isCameraOn,
    messages,
    remoteUser,
    toggleMic,
    toggleCamera,
    sendMessage,
    leaveCall,
  } = useWebRTCCall(
    session,
    loadingSession,
    user,
    isHost || isParticipant
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleChange = () => setIsMobileLayout(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isMobileLayout) {
      setIsVideoFullscreen(false);
      return;
    }

    const handleResize = () => {
      setFloatingVideoPosition((position) => clampFloatingVideoPosition(position));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileLayout]);

  const handleFloatingVideoDragStart = (event) => {
    if (isVideoFullscreen) return;

    floatingVideoDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: floatingVideoPosition.x,
      originY: floatingVideoPosition.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleFloatingVideoDragMove = (event) => {
    const drag = floatingVideoDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    setFloatingVideoPosition(
      clampFloatingVideoPosition({
        x: drag.originX + event.clientX - drag.startX,
        y: drag.originY + event.clientY - drag.startY,
      })
    );
  };

  const handleFloatingVideoDragEnd = (event) => {
    if (floatingVideoDragRef.current?.pointerId === event.pointerId) {
      floatingVideoDragRef.current = null;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  // find the problem data based on session problem title
  const problemData = session?.problemTitle
    ? Object.values(PROBLEMS).find((p) => p.title === session.problemTitle)
    : null;
    useEffect(() => {
    if (session) {
      console.log("Session data:", session);
      console.log("Session problem:", session.problemTitle);
      console.log("Problem data found:", problemData);
    }
  }, [session, problemData]);

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [loadedStarterKey, setLoadedStarterKey] = useState("");
  const [code, setCode] = useState(problemData?.starterCode?.[selectedLanguage] || "");

  const handleRemoteCodeChange = useCallback((remoteCode, remoteLanguage) => {
    if (remoteLanguage) {
      setSelectedLanguage(remoteLanguage);
    }
    setCode(remoteCode || "");
  }, []);

  const handleRemoteLanguageChange = useCallback((remoteLanguage, remoteCode) => {
    setSelectedLanguage(remoteLanguage);
    setCode(remoteCode || "");
    setOutput(null);
  }, []);

  const { broadcastCodeChange, broadcastLanguageChange } = useCollaborativeCode({
    roomId: session?.callId,
    user,
    canJoin: isHost || isParticipant,
    onRemoteCodeChange: handleRemoteCodeChange,
    onRemoteLanguageChange: handleRemoteLanguageChange,
  });

  // redirect the "participant" when session ends
  useEffect(() => {
    if (!session || loadingSession) return;

    if (session.status === "completed") navigate("/dashboard");
  }, [session, loadingSession, navigate]);

  // update code when problem loads or changes
  useEffect(() => {
    const starterKey = `${session?.problemTitle || ""}:${selectedLanguage}`;

    if (problemData?.starterCode?.[selectedLanguage] && loadedStarterKey !== starterKey) {
      setCode(problemData.starterCode[selectedLanguage]);
      setLoadedStarterKey(starterKey);
    }
  }, [problemData, selectedLanguage, loadedStarterKey, session?.problemTitle]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    // use problem-specific starter code
    const starterCode = problemData?.starterCode?.[newLang] || "";
    setCode(starterCode);
    broadcastLanguageChange(newLang, starterCode);
    setOutput(null);
  };

  const handleCodeChange = (value) => {
    const nextCode = value || "";
    setCode(nextCode);
    broadcastCodeChange(nextCode, selectedLanguage);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);

    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);
  };

  const handleEndSession = () => {
    if (confirm("Are you sure you want to end this session? All participants will be notified.")) {
      // this will navigate the HOST to dashboard
      endSessionMutation.mutate(id, { onSuccess: () => navigate("/dashboard") });
    }
  };

  const handleCopySessionCode = async () => {
    if (!session?.sessionCode) return;

    try {
      await navigator.clipboard.writeText(session.sessionCode);
      toast.success("Session code copied");
    } catch {
      toast.error("Could not copy session code");
    }
  };

  if (!loadingSession && sessionError) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="container mx-auto px-6 py-16">
          <div className="card bg-base-100 border-2 border-primary/20 max-w-xl mx-auto">
            <div className="card-body items-center text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-2">
                <PhoneOffIcon className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-2xl font-black">Session code required</h1>
              <p className="text-base-content/70">
                Join this session from the dashboard using the code shared by the host.
              </p>
              <button className="btn btn-primary mt-4" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen bg-base-100 flex flex-col">
      <Navbar />

      {!isMobileLayout && (
      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL - PROBLEM DETAILS */}
          <Panel defaultSize={30} minSize={22}>
                <div className="h-full overflow-y-auto bg-base-200">
                  {/* HEADER SECTION */}
                  <div className="p-6 bg-base-100 border-b border-base-300">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h1 className="text-3xl font-bold text-base-content">
                          {session?.problemTitle || "Loading..."}
                        </h1>
                        {problemData?.category && (
                          <p className="text-base-content/60 mt-1">{problemData.category}</p>
                        )}
                        <p className="text-base-content/60 mt-2">
                          Host: {session?.host?.name || "Loading..."} {"\u2022"}{" "}
                          {session?.participant ? 2 : 1}/2 participants
                        </p>
                        {isHost && session?.sessionCode && (
                          <button
                            className="btn btn-outline btn-sm gap-2 mt-3"
                            onClick={handleCopySessionCode}
                          >
                            <ClipboardIcon className="w-4 h-4" />
                            Code {session.sessionCode}
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge badge-lg ${getDifficultyBadgeClass(
                            session?.difficulty
                          )}`}
                        >
                          {session?.difficulty.slice(0, 1).toUpperCase() +
                            session?.difficulty.slice(1) || "Easy"}
                        </span>
                        {isHost && session?.status === "active" && (
                          <button
                            onClick={handleEndSession}
                            disabled={endSessionMutation.isPending}
                            className="btn btn-error btn-sm gap-2"
                          >
                            {endSessionMutation.isPending ? (
                              <Loader2Icon className="w-4 h-4 animate-spin" />
                            ) : (
                              <LogOutIcon className="w-4 h-4" />
                            )}
                            End Session
                          </button>
                        )}
                        {session?.status === "completed" && (
                          <span className="badge badge-ghost badge-lg">Completed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* problem desc */}
                    {problemData?.description && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
                        <div className="space-y-3 text-base leading-relaxed">
                          <p className="text-base-content/90">{problemData.description.text}</p>
                          {problemData.description.notes?.map((note, idx) => (
                            <p key={idx} className="text-base-content/90">
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* examples section */}
                    {problemData?.examples && problemData.examples.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>

                        <div className="space-y-4">
                          {problemData.examples.map((example, idx) => (
                            <div key={idx}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="badge badge-sm">{idx + 1}</span>
                                <p className="font-semibold text-base-content">Example {idx + 1}</p>
                              </div>
                              <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                                <div className="flex gap-2">
                                  <span className="text-primary font-bold min-w-[70px]">
                                    Input:
                                  </span>
                                  <span>{example.input}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-secondary font-bold min-w-[70px]">
                                    Output:
                                  </span>
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
                    )}

                    {/* Constraints */}
                    {problemData?.constraints && problemData.constraints.length > 0 && (
                      <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                        <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
                        <ul className="space-y-2 text-base-content/90">
                          {problemData.constraints.map((constraint, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              <code className="text-sm">{constraint}</code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* CENTER PANEL - CODE EDITOR & OUTPUT */}
          <Panel defaultSize={38} minSize={30}>
                <PanelGroup direction="vertical">
                  <Panel defaultSize={70} minSize={30}>
                    <CodeEditor
                      language={selectedLanguage}
                      code={code}
                      isrunning={isRunning}
                      onLanguageChange={handleLanguageChange}
                      onCodeChange={handleCodeChange}
                      onRunCode={handleRunCode}
                    />
                  </Panel>

                  <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

                  <Panel defaultSize={30} minSize={15}>
                    <OutputPanel output={output} />
                  </Panel>
                </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL - VIDEO CALLS & CHAT */}
          <Panel defaultSize={32} minSize={24}>
            <div className="h-full bg-base-200 p-4 overflow-auto">
              {isInitializingCall ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-lg">Connecting to video call...</p>
                  </div>
                </div>
              ) : !session?.callId ? (
                <div className="h-full flex items-center justify-center">
                  <div className="card bg-base-100 shadow-xl max-w-md">
                    <div className="card-body items-center text-center">
                      <div className="w-24 h-24 bg-error/10 rounded-full flex items-center justify-center mb-4">
                        <PhoneOffIcon className="w-12 h-12 text-error" />
                      </div>
                      <h2 className="card-title text-2xl">Connection Failed</h2>
                      <p className="text-base-content/70">Unable to connect to the video call</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  <VideoCallUI
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                    isConnected={isConnected}
                    isMicOn={isMicOn}
                    isCameraOn={isCameraOn}
                    messages={messages}
                    remoteUser={remoteUser}
                    currentUser={user}
                    onToggleMic={toggleMic}
                    onToggleCamera={toggleCamera}
                    onSendMessage={sendMessage}
                    onLeaveCall={leaveCall}
                  />
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
      )}

      {isMobileLayout && (
      <div className="flex-1 overflow-y-auto bg-base-200 pb-64">
        <div className="bg-base-100 border-b border-base-300 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-base-content">
                {session?.problemTitle || "Loading..."}
              </h1>
              {problemData?.category && (
                <p className="text-sm text-base-content/60 mt-1">{problemData.category}</p>
              )}
              <p className="text-sm text-base-content/60 mt-2">
                Host: {session?.host?.name || "Loading..."} {"\u2022"}{" "}
                {session?.participant ? 2 : 1}/2 participants
              </p>
              {isHost && session?.sessionCode && (
                <button
                  className="btn btn-outline btn-sm gap-2 mt-3"
                  onClick={handleCopySessionCode}
                >
                  <ClipboardIcon className="w-4 h-4" />
                  Code {session.sessionCode}
                </button>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className={`badge ${getDifficultyBadgeClass(session?.difficulty)}`}>
                {session?.difficulty || "easy"}
              </span>
              {isHost && session?.status === "active" && (
                <button
                  onClick={handleEndSession}
                  disabled={endSessionMutation.isPending}
                  className="btn btn-error btn-xs gap-1"
                >
                  {endSessionMutation.isPending ? (
                    <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <LogOutIcon className="w-3.5 h-3.5" />
                  )}
                  End
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {problemData?.description && (
            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
              <h2 className="text-xl font-bold mb-4 text-base-content">Description</h2>
              <div className="space-y-3 text-base leading-relaxed">
                <p className="text-base-content/90">{problemData.description.text}</p>
                {problemData.description.notes?.map((note, idx) => (
                  <p key={idx} className="text-base-content/90">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          )}

          {problemData?.examples && problemData.examples.length > 0 && (
            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
              <h2 className="text-xl font-bold mb-4 text-base-content">Examples</h2>
              <div className="space-y-4">
                {problemData.examples.map((example, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="badge badge-sm">{idx + 1}</span>
                      <p className="font-semibold text-base-content">Example {idx + 1}</p>
                    </div>
                    <div className="bg-base-200 rounded-lg p-4 font-mono text-sm space-y-1.5">
                      <div className="flex gap-2">
                        <span className="text-primary font-bold min-w-[70px]">Input:</span>
                        <span>{example.input}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-secondary font-bold min-w-[70px]">Output:</span>
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
          )}

          {problemData?.constraints && problemData.constraints.length > 0 && (
            <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
              <h2 className="text-xl font-bold mb-4 text-base-content">Constraints</h2>
              <ul className="space-y-2 text-base-content/90">
                {problemData.constraints.map((constraint, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <code className="text-sm">{constraint}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="h-[520px] border-t border-base-300">
          <CodeEditor
            language={selectedLanguage}
            code={code}
            isrunning={isRunning}
            onLanguageChange={handleLanguageChange}
            onCodeChange={handleCodeChange}
            onRunCode={handleRunCode}
          />
        </div>

        <div className="h-80 border-t border-base-300">
          <OutputPanel output={output} />
        </div>
      </div>
      )}

      {isMobileLayout && (
      <div
        className={`fixed z-50 ${
          isVideoFullscreen
            ? "inset-0 bg-base-300/95 p-3"
            : "h-52 w-72 max-w-[calc(100vw-2rem)]"
        }`}
        style={
          isVideoFullscreen
            ? undefined
            : {
                left: floatingVideoPosition.x,
                top: floatingVideoPosition.y,
              }
        }
      >
        {!isVideoFullscreen && (
          <div
            className="absolute -top-8 left-1/2 z-10 flex h-8 w-28 -translate-x-1/2 touch-none cursor-grab items-center justify-center rounded-t-lg border border-b-0 border-base-300 bg-base-100 shadow-lg active:cursor-grabbing"
            onPointerDown={handleFloatingVideoDragStart}
            onPointerMove={handleFloatingVideoDragMove}
            onPointerUp={handleFloatingVideoDragEnd}
            onPointerCancel={handleFloatingVideoDragEnd}
            title="Drag video"
          >
            <span className="h-1 w-10 rounded-full bg-base-content/35" />
          </div>
        )}
        {isInitializingCall ? (
          <div className="h-full rounded-lg border border-base-300 bg-base-100 shadow-2xl flex items-center justify-center">
            <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : session?.callId ? (
          <VideoCallUI
            compact
            isFullscreen={isVideoFullscreen}
            onToggleFullscreen={() => setIsVideoFullscreen((value) => !value)}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            isConnected={isConnected}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            messages={messages}
            remoteUser={remoteUser}
            currentUser={user}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onSendMessage={sendMessage}
            onLeaveCall={leaveCall}
          />
        ) : null}
      </div>
      )}
    </div>
  );
}

export default SessionPage;
