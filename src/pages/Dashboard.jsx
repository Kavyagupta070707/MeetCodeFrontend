import { useNavigate } from "react-router"
import {
  useActiveSessions,
  useCreateSession,
  useJoinSession,
  useRecentSessions,
} from "../hooks/useSessions.js";
import Navbar from "../components/Navbar.jsx";
import WelcomeSection from "../components/WelcomeSection.jsx";
import { useState } from "react";
import toast from "react-hot-toast";
import JoinSession from "../components/JoinSession.jsx";
import StatsCards from "../components/StatsCards.jsx";
import RecentSessions from "../components/RecentSessions.jsx";
import ActiveSessions from "../components/ActiveSessions.jsx";
import CreateSessionModal from "../components/CreateSessionModel.jsx";
import { useCurrentUser } from "../hooks/useCurrentUser.js";


const Dashboard = () => {
  const navigate = useNavigate();
  const [showModel, setShowModel] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" })
  const [sessionCode, setSessionCode] = useState("");

  const createSession = useCreateSession();
  const joinSession = useJoinSession();
  const { data: currentUserData } = useCurrentUser();
  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useRecentSessions();

  const handleCreateRoom = async () => {
    if (!roomConfig.problem || !roomConfig.difficulty) {
      toast.error("Please fill all the fields")
      return;
    }

    createSession.mutate({
      problem: roomConfig.problem,
      difficulty: roomConfig.difficulty.toLowerCase()
    },
      {
        onSuccess: (data) => {
          console.log("Session created:", data);
          setShowModel(false),
            navigate(`/session/${data.session._id}`)
        }
      })

  }

  const handleJoinSession = (event) => {
    event.preventDefault();

    if (sessionCode.trim().length !== 6) {
      toast.error("Enter a valid session code")
      return;
    }

    joinSession.mutate(sessionCode.trim().toUpperCase(), {
      onSuccess: (data) => {
        setSessionCode("");
        navigate(`/session/${data.session._id}`)
      }
    })
  }

  const recentSessions = recentSessionsData?.sessions || [];
  const activeSessions = activeSessionsData?.sessions || [];

  return (
    <>
     <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowModel(true)} />

        <main className="max-w-7xl mx-auto px-6 pb-16 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-4">
              <StatsCards rating={currentUserData?.user?.rating ?? 1000} />
            </div>
            <div className="lg:col-span-8">
              <JoinSession
                sessionCode={sessionCode}
                setSessionCode={setSessionCode}
                onJoinSession={handleJoinSession}
                isJoining={joinSession.isPending}
              />
            </div>
          </div>

          <ActiveSessions
            sessions={activeSessions}
            isLoading={loadingActiveSessions}
            onRejoinSession={(sessionId) => navigate(`/session/${sessionId}`)}
          />

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
        </main>
      </div>

      <CreateSessionModal
        isOpen={showModel}
        onClose={() => setShowModel(false)}
        roomConfig={roomConfig}
        setRoomConfig={setRoomConfig}
        onCreateRoom={handleCreateRoom}
        isCreating={createSession.isPending}
      />
    </>
  )
}

export default Dashboard
