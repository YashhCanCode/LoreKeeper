import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');

  const handleStartBuilding = () => {
    setView('dashboard');
    window.scrollTo({ top: 0 });
  };

  const handleBackToLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="relative min-h-screen bg-midnight-black text-purple-100 antialiased selection:bg-pink-500 selection:text-white">

      {/* Shared Navbar */}
      <Navbar
        onStartBuilding={handleStartBuilding}
        onBackToLanding={handleBackToLanding}
      />

      {view === 'landing' ? (
        <>
          {/* Dynamic Background Glow overlays */}
          <div className="absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-b from-transparent to-midnight-black pointer-events-none z-10" />

          {/* Landing Page Content */}
          <Hero onStartBuilding={handleStartBuilding} />
          <Features />
          <HowItWorks />
          <Testimonials />
          <FinalCTA />
          <Footer />
        </>
      ) : (
        /* Fullscreen Interactive SaaS Workspace Dashboard */
        <Dashboard onBackToLanding={handleBackToLanding} />
      )}
    </div>
  );
}

export default App;
