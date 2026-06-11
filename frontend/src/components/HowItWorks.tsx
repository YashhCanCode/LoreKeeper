import { motion } from 'framer-motion';
import { FileUp, Database, Sparkles } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: <FileUp className="w-6 h-6 text-soft-pink" />,
      title: "Feed the Keeper",
      desc: "Drag and drop your notes, outlines, timelines, and PDFs. LoreKeeper reads and organizes your story details.",
      bg: "from-pink-500/10 to-transparent",
      border: "border-pink-500/20"
    },
    {
      num: "02",
      icon: <Database className="w-6 h-6 text-lavender-accent" />,
      title: "Build Your Story Map",
      desc: "LoreKeeper goes through your material and connects characters, places, items, and factions so it remembers how everything fits together.",
      bg: "from-purple-500/10 to-transparent",
      border: "border-purple-500/20"
    },
    {
      num: "03",
      icon: <Sparkles className="w-6 h-6 text-orange-400" />,
      title: "Ask Questions",
      desc: "Chat about your story, ask about characters, check for contradictions, and generate new text that stays true to your story.",
      bg: "from-orange-500/10 to-transparent",
      border: "border-orange-500/20"
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-midnight-black z-20">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vh] rounded-full bg-deep-purple-900/20 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-soft-pink to-lavender-accent uppercase mb-3">
            How It Works
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How LoreKeeper keeps your story consistent.
          </h3>
        </div>

        {/* Steps Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          
          {/* Decorative Connecting line (desktop only) */}
          <div className="absolute top-[80px] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 hidden lg:block z-0" />

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center z-10 group"
            >
              {/* Step Number Circle */}
              <div className="w-16 h-16 rounded-full bg-deep-purple-950 border border-white/10 flex items-center justify-center mb-6 shadow-xl relative group-hover:border-pink-500/40 transition-colors duration-300">
                <span className="text-xs font-semibold text-purple-300/60 font-mono absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-deep-purple-900 border border-white/5">
                  {step.num}
                </span>
                {step.icon}
              </div>

              {/* Step Card */}
              <div className={`w-full glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-b ${step.bg} hover:border-white/10 transition-all duration-300`}>
                <h4 className="text-2xl font-bold text-white mb-4">{step.title}</h4>
                <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}
