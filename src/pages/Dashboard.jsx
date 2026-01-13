import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router"
import { useActiveSessions, useCreateSession, useRecentSessions } from "../hooks/useSessions.js";
import Navbar from "../components/Navbar.jsx";
import WelcomeSection from "../components/WelcomeSection.jsx";
import { useState } from "react";
import toast from "react-hot-toast";
import ActiveSessions from "../components/ActiveSessions.jsx";
import StatsCards from "../components/StatsCards.jsx";
import RecentSessions from "../components/RecentSessions.jsx";
import CreateSessionModal from "../components/CreateSessionModel.jsx";


const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser()
  const [showModel, setShowModel] = useState(false);
  const [roomConfig, setRoomConfig] = useState({ problem: "", difficulty: "" })

  const createSession = useCreateSession();
  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useRecentSessions();
  const { data: activeSessionsData, isLoading: loadingActiveSessions } = useActiveSessions()

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
  const activeSessions = activeSessionsData?.sessions || [];
  const recentSessions = recentSessionsData?.sessions || [];
 const isUserInSession = (session) => {
    if (!user.id) return false;

    return session.host?.clerkId === user.id || session.participant?.clerkId === user.id;
  };

  return (
    <>
     <div className="min-h-screen bg-base-300">
        <Navbar />
        <WelcomeSection onCreateSession={() => setShowModel(true)} />

        {/* Grid layout */}
        <div className="container mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatsCards
              activeSessionsCount={activeSessions.length}
              recentSessionsCount={recentSessions.length}
            />
            <ActiveSessions
              sessions={activeSessions}
              isLoading={loadingActiveSessions}
              isUserInSession={isUserInSession}
            />
          </div>

          <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />
        </div>
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