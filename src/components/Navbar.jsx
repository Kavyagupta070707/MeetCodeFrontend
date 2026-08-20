import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon, SwordsIcon, HeartHandshake } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";

function Navbar() {
  const location = useLocation();

  // console.log(location);

  const isActive = (path) =>
    location.pathname === path || (path === "/one-v-one" && location.pathname.startsWith(path));

  return (
    <nav className="bg-base-100/90 backdrop-blur-md border-b border-base-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to={"/"} className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <HeartHandshake className="size-5" />
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-wide leading-none">
                  MeetCode
                </span>
                <span className="text-xs text-base-content/60 font-medium mt-1">Let's Code Together</span>
              </div>
            </Link>

        <div className="flex items-center gap-2">
          {/* DASHBOARD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${
                isActive("/dashboard")
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          <Link
            to={"/one-v-one"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${
                isActive("/one-v-one")
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <SwordsIcon className="size-4" />
              <span className="font-medium hidden sm:inline">1v1</span>
            </div>
          </Link>

          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-4 py-2.5 rounded-lg transition-all duration-200 
              ${
                isActive("/problems")
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              }
              
              `}
          >
            <div className="flex items-center gap-x-2.5">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          <div className="ml-3 flex items-center">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
