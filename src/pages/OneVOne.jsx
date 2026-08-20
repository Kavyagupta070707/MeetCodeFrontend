import { useNavigate } from "react-router";
import { Loader2Icon, SwordsIcon, TrophyIcon, ZapIcon } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import { useMatchOneVOne } from "../hooks/useOneVOne.js";

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
    icon: ZapIcon,
    tone: "border-success/30 hover:border-success bg-success/10",
  },
  {
    value: "medium",
    label: "Medium",
    icon: SwordsIcon,
    tone: "border-warning/30 hover:border-warning bg-warning/10",
  },
  {
    value: "hard",
    label: "Hard",
    icon: TrophyIcon,
    tone: "border-error/30 hover:border-error bg-error/10",
  },
];

function OneVOne() {
  const navigate = useNavigate();
  const matchOneVOne = useMatchOneVOne();

  const handleMatch = (difficulty) => {
    matchOneVOne.mutate(difficulty, {
      onSuccess: (data) => {
        navigate(`/one-v-one/session/${data.session._id}`);
      },
    });
  };

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <SwordsIcon className="size-7 text-primary" />
            </div>
            <h1 className="text-4xl font-black">One vs One</h1>
          </div>
          <p className="text-base-content/60 text-lg">
            Pick a difficulty and get matched into a 15 minute coding duel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DIFFICULTIES.map((difficulty) => {
            const Icon = difficulty.icon;
            const isLoading =
              matchOneVOne.isPending && matchOneVOne.variables === difficulty.value;

            return (
              <button
                key={difficulty.value}
                className={`card border-2 text-left transition-all hover:-translate-y-1 ${difficulty.tone}`}
                onClick={() => handleMatch(difficulty.value)}
                disabled={matchOneVOne.isPending}
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-base-100 rounded-2xl">
                      {isLoading ? (
                        <Loader2Icon className="size-7 animate-spin text-primary" />
                      ) : (
                        <Icon className="size-7 text-primary" />
                      )}
                    </div>
                    <span className="badge badge-ghost">15 min</span>
                  </div>
                  <h2 className="text-2xl font-black mt-5">{difficulty.label}</h2>
                  <p className="text-base-content/60">
                    {isLoading ? "Finding opponent..." : "Find a matching opponent"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default OneVOne;
