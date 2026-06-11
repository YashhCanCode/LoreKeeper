import { motion } from 'framer-motion';
import { Play, Sparkles, Wand2 } from 'lucide-react';
import BackgroundParticles from './BackgroundParticles';

interface HeroProps {
  onStartBuilding: () => void;
}

export default function Hero({ onStartBuilding }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
      
      {/* Sunset Artwork Background (Brighter with brightness-[0.95] and contrast-[1.0]) */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 filter brightness-[0.95] contrast-[1.0]"
        style={{ 
          backgroundImage: "url('/assets/hero-bg.jpg')",
          backgroundAttachment: 'scroll' 
        }}
      />

      {/* Cinematic Vignette & Fade-to-Black bottom transition (Softer overlays) */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight-black via-deep-purple-950/20 to-black/5 z-1 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-midnight-black/25 z-1 pointer-events-none" />

      {/* Glowing atmospheric orbs behind the text */}
      <div className="absolute top-1/3 left-1/4 w-[25vw] h-[25vw] rounded-full bg-soft-pink/10 blur-[120px] pointer-events-none z-1 animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/4 w-[30vw] h-[30vw] rounded-full bg-lavender-accent/10 blur-[150px] pointer-events-none z-1 animate-float" />

      {/* Background Particles Canvas */}
      <BackgroundParticles />

      {/* Hero Content Container */}
      <div className="relative max-w-5xl mx-auto px-6 text-center z-20 flex flex-col items-center">
        
        {/* Subtle Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel-light text-xs font-medium text-pink-200/90 mb-8 border border-white/5 shadow-inner"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>RAG-Powered AI for Worldbuilders & Writers</span>
        </motion.div>

        {/* Cinematic Large Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight font-sans leading-[1.1] mb-6 select-none"
        >
          <span className="text-white block md:inline">Your world's memory </span>
          <span className="text-gradient-purple-pink block md:inline">never forgets.</span>
        </motion.h1>

        {/* Supporting description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
          className="text-base md:text-xl text-purple-200/70 max-w-2xl mx-auto mb-10 leading-relaxed font-sans font-light"
        >
          Upload your story notes, character sheets, and timelines. Keep your story consistent with an AI that always checks the facts before answering.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full"
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              onStartBuilding();
            }}
            className="glow-btn flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white bg-gradient-to-r from-deep-purple-700 via-soft-pink to-lavender-accent border border-white/10 hover:scale-105 active:scale-95 shadow-xl shadow-pink-500/20 hover:shadow-pink-500/35 transition-all duration-300 cursor-pointer"
          >
            <Wand2 className="w-5 h-5 text-pink-100" />
            <span>Start Building</span>
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onStartBuilding(); // Directly take them to the live workspace demo
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-purple-200 hover:text-white glass-panel hover:bg-white/10 border border-white/10 hover:scale-105 active:scale-95 hover:border-pink-500/30 transition-all duration-300 shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current text-lavender-accent" />
            <span>Watch Demo</span>
          </button>
        </motion.div>

        {/* Subtle decorative element pointing down */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer hidden md:flex"
        >
          <span className="text-[10px] uppercase tracking-widest text-purple-300/40">Scroll to Explore</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-purple-400/40 to-transparent" />
        </motion.div>

      </div>
    </section>
  );
}

