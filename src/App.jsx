
import { SignIn, SignInButton, useUser } from '@clerk/clerk-react'
import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import { LoaderIcon, Toaster } from 'react-hot-toast';
import ProblemsPage from './pages/ProblemsPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Problem from './pages/Problem.jsx';
import SessionPage from './pages/SessionPage.jsx';
function App() {

  const { isSignedIn, isLoaded } = useUser();
  

  return (
    console.log(import.meta.env.VITE_API_BASE_URL),
    <div className='h-screen'>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        {/* <Route path="/problems" element={<ProblemsPage/>}/> */}
        <Route path="/dashboard" element={
          !isLoaded ? <div className="flex items-center justify-center py-20">
              <LoaderIcon className="h-120px w-120px animate-spin text-primary" />
            </div> : isSignedIn ? <Dashboard /> : <Navigate to="/" />
        } />
        <Route path="/problem/:id" element={
          !isLoaded ? <div className="flex items-center justify-center py-20">
              <LoaderIcon className="h-120px w-120px animate-spin text-primary" />
            </div> : isSignedIn ? <Problem /> : <Navigate to="/" />
        } />
        <Route path="/problems" element={
          !isLoaded ? <div className="flex items-center justify-center py-20">
              <LoaderIcon className="h-120px w-120px animate-spin text-primary" />
            </div> : isSignedIn ? <ProblemsPage /> : <Navigate to="/" />
        } />
        <Route path="/session/:id" element={
          !isLoaded ? <div className="flex items-center justify-center py-20">
              <LoaderIcon className="h-120px w-120px animate-spin text-primary" />
            </div> : isSignedIn ? <SessionPage /> : <Navigate to="/" />
        } />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
