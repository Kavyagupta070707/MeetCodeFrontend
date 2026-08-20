import { SignInButton, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  HeartHandshakeIcon,
  LockIcon,
  SwordsIcon,
  UsersIcon,
  VideoIcon,
} from "lucide-react";

const highlights = [
  "Private rooms",
  "Rated 1v1 coding duels",
  "Practice problems",
];

const workflows = [
  {
    icon: LockIcon,
    title: "Create a private room",
    description: "Start a room and share the code only with your partner.",
  },
  {
    icon: SwordsIcon,
    title: "Match into a 1v1 duel",
    description: "Pick a difficulty and get a timed challenge with another coder.",
  },
  {
    icon: Code2Icon,
    title: "Solve in the browser",
    description: "Read the prompt, write code, run tests, and finish the problem.",
  },
];

const Home = () => {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/dashboard");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-300 text-base-content">
      <nav className="sticky top-0 z-50 border-b border-base-100/10 bg-base-300/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-base-100 text-primary">
              <HeartHandshakeIcon className="size-5" />
            </div>
            <div>
              <span className="block text-xl font-black">MeetCode</span>
              <span className="block text-xs font-medium text-base-content/55">
                Code together. Compete better.
              </span>
            </div>
          </Link>

          <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
            <button className="btn btn-primary rounded-lg px-5">
              Get Started
              <ArrowRightIcon className="size-4" />
            </button>
          </SignInButton>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2 text-sm font-bold text-primary">
              <SwordsIcon className="size-4" />
              Private rooms and rated 1v1 duels
            </div>

            <h1 className="text-5xl font-black leading-tight sm:text-6xl lg:text-7xl">
              MeetCode
              <span className="block text-primary">code with real people.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-base-content/75">
              Create private coding rooms, invite by session code, practice problems, or start a
              timed 1v1 duel. Everything is built around getting into the editor fast and solving.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="btn btn-primary btn-lg rounded-lg">
                  Start Coding
                  <ArrowRightIcon className="size-5" />
                </button>
              </SignInButton>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="btn btn-outline btn-lg rounded-lg">
                  Find a 1v1
                  <SwordsIcon className="size-5" />
                </button>
              </SignInButton>
            </div>
          </div>

          <div className="space-y-6">
            <img
              src="/hero.png"
              alt="MeetCode collaborative coding workspace"
              className="w-full rounded-lg border border-base-content/10 shadow-2xl"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg border border-primary/25 px-3 py-3 text-center text-sm font-semibold text-primary"
                >
                  <CheckIcon className="size-4 text-base-content" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16">
          <div className="py-8">
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
              <div className="max-w-xl">
                <p className="font-bold text-primary">Built for coding practice</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                  Start a session, solve the problem, see the result.
                </h2>
                <p className="mt-5 text-base leading-7 text-base-content/65">
                  No public room hunting and no noisy lobby. MeetCode keeps the path from invite
                  or match to editor short.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {workflows.map(({ icon: Icon, title, description }, index) => (
                  <div
                    key={title}
                    className="rounded-lg border border-base-content/10 bg-base-100 p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-base-300 text-primary">
                        <Icon className="size-6" />
                      </div>
                      <p className="text-sm font-bold text-base-content/45">0{index + 1}</p>
                    </div>
                    <h3 className="text-xl font-black leading-snug">{title}</h3>
                    <p className="mt-3 leading-7 text-base-content/65">{description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 pt-8">
          <div className="mb-14 text-center">
            <h2 className="text-3xl font-black leading-tight text-primary sm:text-4xl">
              Everything You Need to <span className="text-base-content">Succeed</span>
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-base-content/65">
              Powerful features designed to make your coding interviews seamless and productive.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border border-base-content/10 bg-base-100 p-8 text-center shadow-xl shadow-base-300/30">
              <div className="mx-auto flex size-20 items-center justify-center rounded-lg bg-base-300 text-primary">
                <VideoIcon className="size-9" />
              </div>
              <h3 className="mt-8 text-xl font-black">HD Video Call</h3>
              <p className="mx-auto mt-4 max-w-sm leading-7 text-base-content/65">
                Clear video and audio for private coding sessions and interview practice.
              </p>
            </div>

            <div className="rounded-lg border border-base-content/10 bg-base-100 p-8 text-center shadow-xl shadow-base-300/30">
              <div className="mx-auto flex size-20 items-center justify-center rounded-lg bg-base-300 text-primary">
                <Code2Icon className="size-9" />
              </div>
              <h3 className="mt-8 text-xl font-black">Live Code Editor</h3>
              <p className="mx-auto mt-4 max-w-sm leading-7 text-base-content/65">
                Write, run, and compare solutions with language-aware starter code.
              </p>
            </div>

            <div className="rounded-lg border border-base-content/10 bg-base-100 p-8 text-center shadow-xl shadow-base-300/30">
              <div className="mx-auto flex size-20 items-center justify-center rounded-lg bg-base-300 text-primary">
                <UsersIcon className="size-9" />
              </div>
              <h3 className="mt-8 text-xl font-black">Easy Collaboration</h3>
              <p className="mx-auto mt-4 max-w-sm leading-7 text-base-content/65">
                Join by code, match by difficulty, and stay focused on the problem.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
