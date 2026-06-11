import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="relative py-28 bg-midnight-black z-20 overflow-hidden">
      
      {/* Absolute Portal Glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-deep-purple-950 via-soft-pink/15 to-lavender-accent/15 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Glow-bordered card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative rounded-[32px] p-8 md:p-16 border border-white/10 bg-gradient-to-tr from-deep-purple-900/60 via-deep-purple-950/45 to-purple-900/30 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col items-center text-center"
        >
          {/* Subtle light leak at top */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-soft-pink to-transparent" />

          {/* Decorative Sparkle */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-deep-purple-800 to-soft-pink flex items-center justify-center p-[1px] mb-8 shadow-lg shadow-pink-500/10">
            <div className="w-full h-full rounded-2xl bg-deep-purple-950 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-lavender-accent" />
            </div>
          </div>

          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 max-w-xl leading-tight">
            Keep your story consistent. Get started today.
          </h3>
          
          <p className="text-purple-200/60 font-light text-sm md:text-base max-w-lg mb-10 leading-relaxed">
            Join thousands of novelists, screenwriters, and game designers structuring lore and writing stories without contradictions.
          </p>

          {/* Glowing input box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <div className="relative w-full">
              <input 
                type="email" 
                placeholder="Enter your storyteller email"
                className="w-full bg-midnight-black/60 border border-white/10 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/10 transition-all placeholder-purple-300/30"
              />
            </div>
            <button className="glow-btn flex items-center justify-center gap-2 w-full sm:w-auto shrink-0 px-8 py-4 rounded-full font-bold text-sm text-white bg-gradient-to-r from-deep-purple-700 via-soft-pink to-lavender-accent border border-white/10 hover:shadow-lg hover:shadow-pink-500/20 active:scale-95 transition-all">
              <span>Enter Sanctuary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Soft security caption */}
          <span className="text-[10px] text-purple-300/30 mt-4 block">
            Start free. No credit card required. Lock in your world.
          </span>

        </motion.div>

      </div>
    </section>
  );
}
