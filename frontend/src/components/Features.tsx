import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  MessageSquare, 
  BookmarkCheck, 
  ShieldAlert, 
  Sparkles, 
  Network, 
  FileText,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Features() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };


  return (
    <section id="features" className="relative py-24 bg-midnight-black z-20">
      {/* Decorative subtle top-blend gradient */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-transparent to-midnight-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-soft-pink to-lavender-accent uppercase mb-3">
            Architect of Worlds
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Features woven for master worldbuilders.
          </h3>
          <p className="mt-4 text-purple-200/60 font-light text-base md:text-lg">
            Maintain strict consistency across storylines, characters, magic systems, and timelines with tools designed for writers, by designers.
          </p>
        </div>

        {/* Feature Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          
          {/* Card 1: Story Bible Upload */}
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between h-[450px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center border border-pink-500/20 mb-6">
                <UploadCloud className="w-6 h-6 text-soft-pink" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Story Bible Upload</h4>
              <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                Seamlessly upload PDFs, Markdown nodes, character sheets, and scrap notes. LoreKeeper catalogs every detail.
              </p>
            </div>
            
            {/* Visual Mockup */}
            <div className="mt-6 glass-panel-light rounded-2xl p-4 border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-deep-purple-900/40 border border-white/5">
                  <FileText className="w-5 h-5 text-pink-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">silmarillion_bible.md</p>
                    <p className="text-[10px] text-purple-300/40">Markdown • 4.2 MB</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-deep-purple-900/20 border border-white/5 opacity-60">
                  <FileText className="w-5 h-5 text-lavender-accent" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">valar_genealogy.pdf</p>
                    <p className="text-[10px] text-purple-300/40">PDF • 12.8 MB</p>
                  </div>
                  <div className="w-12 h-1 bg-purple-950 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-soft-pink rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Story Chat */}
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between h-[450px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-6">
                <MessageSquare className="w-6 h-6 text-lavender-accent" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Story Chat</h4>
              <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                Ask questions about your story's history, rules, or characters and get answers based only on what you've written.
              </p>
            </div>
            
            {/* Visual Mockup */}
            <div className="mt-6 glass-panel-light rounded-2xl p-4 border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-end gap-3 text-left">
              <div className="self-end bg-gradient-to-r from-deep-purple-700 to-soft-pink px-3 py-2 rounded-2xl rounded-tr-sm text-xs text-white max-w-[85%] font-light">
                Does Alistair possess magic?
              </div>
              <div className="self-start bg-deep-purple-900/60 border border-white/5 px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-purple-200/80 max-w-[85%] font-light">
                Yes, but restricted. Under the Moon Treaty, Alistair cannot cast spells during daylight.
              </div>
            </div>
          </motion.div>

          {/* Card 3: Source Citations */}
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between h-[450px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-6">
                <BookmarkCheck className="w-6 h-6 text-orange-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Source Citations</h4>
              <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                Zero hallucination. Every character trait, timeline event, and lore detail comes with an interactive footnote mapping back to its source.
              </p>
            </div>
            
            {/* Visual Mockup */}
            <div className="mt-6 glass-panel-light rounded-2xl p-4 border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center">
              <div className="p-3 bg-deep-purple-900/30 rounded-xl border border-white/5">
                <p className="text-xs text-purple-200/80 leading-relaxed font-light">
                  "The Moon Treaty was signed at the Whispering River in 412 AC <span className="inline-block px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-semibold text-[10px] cursor-pointer">doc #4</span> after the long winter."
                </p>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2 text-[10px] text-pink-400">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>doc #4: Moon_Treaty_Accord.md (Line 42)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Consistency Checker */}
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between h-[450px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-6">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Consistency Checker</h4>
              <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                Prevent plot holes. The AI analyzes your narrative drafts in real-time to alert you of temporal, geographic, or character logic errors.
              </p>
            </div>
            
            {/* Visual Mockup */}
            <div className="mt-6 glass-panel-light rounded-2xl p-4 border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center">
              <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/20 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-xs font-bold text-rose-300">Lore Contradiction</p>
                  <p className="text-[10px] text-purple-200/70 mt-1 leading-relaxed">
                    You wrote that Alistair enters the tavern in the evening, but in Chapter 7, Alistair is locked in the Iron Fortress dungeon until midnight.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 5: Creative Generation */}
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between h-[450px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-6">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Creative Generation</h4>
              <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                Draft lore-conforming dialogues, battle scenes, or item descriptions. The AI references your exact rules so everything fits.
              </p>
            </div>
            
            {/* Visual Mockup */}
            <div className="mt-6 glass-panel-light rounded-2xl p-4 border border-white/5 relative overflow-hidden flex-1 flex flex-col justify-center text-left">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 uppercase font-semibold">Generating scene...</span>
              </div>
              <div className="p-2.5 bg-deep-purple-900/40 rounded-xl border border-white/5 font-mono text-[10px] text-purple-300 leading-normal">
                "The shadow merchant slid the Moon-Iron blade across the table. 'Forged in 412,' he whispered. Alistair frowned, remembering the day the smithies burned..."
              </div>
            </div>
          </motion.div>

          {/* Card 6: World Memory */}
          <motion.div variants={itemVariants} className="glass-panel glass-panel-hover p-8 rounded-3xl flex flex-col justify-between h-[450px]">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 mb-6">
                <Network className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">World Memory</h4>
              <p className="text-purple-200/50 text-sm font-light leading-relaxed">
                An evolving relational database representing character hierarchies, faction dynamics, item ownerships, and world landmarks.
              </p>
            </div>
            
            {/* Visual Mockup */}
            <div className="mt-6 glass-panel-light rounded-2xl p-4 border border-white/5 relative overflow-hidden flex-1 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Node Graph Mock */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-soft-pink to-lavender-accent flex items-center justify-center text-[10px] text-white font-bold z-10 shadow-lg shadow-pink-500/20">
                  Ali
                </div>
                
                {/* Connecting nodes */}
                <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-deep-purple-800 border border-white/10 flex items-center justify-center text-[8px] text-purple-200">
                  Ring
                </div>
                <div className="absolute bottom-4 right-6 w-10 h-10 rounded-full bg-deep-purple-800 border border-white/10 flex items-center justify-center text-[8px] text-purple-200">
                  Sanctum
                </div>
                <div className="absolute top-10 right-8 w-7 h-7 rounded-full bg-deep-purple-800 border border-white/10 flex items-center justify-center text-[8px] text-purple-200">
                  Valar
                </div>
                
                {/* SVG Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full stroke-purple-500/30 stroke-[1.5] fill-none z-0">
                  <line x1="50%" y1="50%" x2="20%" y2="25%" />
                  <line x1="50%" y1="50%" x2="80%" y2="75%" />
                  <line x1="50%" y1="50%" x2="75%" y2="30%" />
                  <line x1="20%" y1="25%" x2="75%" y2="30%" strokeDasharray="3,3" />
                </svg>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
