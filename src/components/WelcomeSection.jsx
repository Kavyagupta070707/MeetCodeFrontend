
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router";
import { ArrowRightIcon, BookOpenIcon, SwordsIcon, ZapIcon } from "lucide-react";

function WelcomeSection({ onCreateSession }) {
  const { user } = useUser();

  return (
    <div className="relative">
      <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-5">
        <div className="py-5 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3">
              <h1 className="text-3xl md:text-4xl font-black text-base-content leading-tight">
                Welcome back,{" "}
                <span className="text-primary">{user?.firstName || "there"}</span>!
              </h1>
            </div>
            <p className="text-base text-base-content/65">
              Create a private room, join by code, or jump into a rated 1v1 duel.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCreateSession}
              className="group btn btn-primary h-12 px-5 rounded-lg text-primary-content"
            >
              <ZapIcon className="w-5 h-5" />
              <span>Create Session</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link to="/one-v-one" className="btn btn-outline h-12 px-5 rounded-lg gap-2">
              <SwordsIcon className="w-5 h-5" />
              <span>Start 1v1</span>
            </Link>
            <Link to="/problems" className="btn btn-outline h-12 px-5 rounded-lg gap-2">
              <BookOpenIcon className="w-5 h-5" />
              <span>Practice</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;
