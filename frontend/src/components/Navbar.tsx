import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onStartBuilding: () => void;
  onBackToLanding: () => void;
}

export default function Navbar({ onStartBuilding, onBackToLanding }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 w-full z-50 px-6 py-4 lg:px-12"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-full shadow-lg shadow-black/25 backdrop-blur-md">
        
        {/* Logo */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            onBackToLanding();
          }} 
          className="flex items-center gap-2 group cursor-pointer text-left bg-transparent border-none p-0"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-deep-purple-700 to-soft-pink p-[1.5px] shadow-md shadow-pink-500/20">
            <div className="w-full h-full rounded-full bg-deep-purple-950 flex items-center justify-center transition-transform group-hover:scale-95 duration-300">
              <BookOpen className="w-5 h-5 text-lavender-accent group-hover:text-soft-pink transition-colors duration-300" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-wide text-white group-hover:text-lavender-accent transition-colors duration-300 font-sans">
            Lore<span className="text-transparent bg-clip-text bg-gradient-to-r from-soft-pink to-lavender-accent">Keeper</span>
          </span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-purple-200/80">
          <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How It Works</a>
          <a href="#demo" className="hover:text-white transition-colors duration-300">Workspace</a>
          <a href="#testimonials" className="hover:text-white transition-colors duration-300">Testimonials</a>
        </div>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              onStartBuilding();
            }} 
            className="text-sm font-medium text-purple-200/80 hover:text-white transition-colors duration-300 cursor-pointer bg-transparent border-none"
          >
            Sign In
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              onStartBuilding();
            }} 
            className="glow-btn px-5 py-2 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-deep-purple-700 via-soft-pink to-lavender-accent hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 border border-white/10 cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-purple-200 hover:text-white transition-colors cursor-pointer"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="md:hidden mt-3 mx-2 glass-panel p-6 rounded-3xl flex flex-col gap-4 text-center shadow-2xl backdrop-blur-xl border border-white/10"
        >
          <a href="#features" onClick={() => setIsOpen(false)} className="py-2 text-purple-200 hover:text-white border-b border-white/5 transition-colors">Features</a>
          <a href="#how-it-works" onClick={() => setIsOpen(false)} className="py-2 text-purple-200 hover:text-white border-b border-white/5 transition-colors">How It Works</a>
          <a href="#demo" onClick={() => setIsOpen(false)} className="py-2 text-purple-200 hover:text-white border-b border-white/5 transition-colors">Workspace</a>
          <a href="#testimonials" onClick={() => setIsOpen(false)} className="py-2 text-purple-200 hover:text-white border-b border-white/5 transition-colors">Testimonials</a>
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => {
                setIsOpen(false);
                onStartBuilding();
              }} 
              className="py-2 text-purple-200 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              Sign In
            </button>
            <button 
              onClick={() => {
                setIsOpen(false);
                onStartBuilding();
              }} 
              className="glow-btn py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-deep-purple-700 via-soft-pink to-lavender-accent border border-white/10 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

