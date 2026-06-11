import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: "Elara Vance",
      role: "Epic Fantasy Novelist",
      quote: "Managing a 6-book series was becoming an absolute nightmare. LoreKeeper caught 12 timeline contradictions and a character resurrection mismatch that my editors missed. It's a sanctuary.",
      rating: 5,
      avatar: "EV"
    },
    {
      name: "Marcus Thorne",
      role: "Lead Narrative Designer, Archon Games",
      quote: "Our game world has over 3,000 years of history, dozens of factions, and multiple branching timelines. LoreKeeper is our source of truth - the AI answers are always accurate to our story.",
      rating: 5,
      avatar: "MT"
    },
    {
      name: "Sylvia Chen",
      role: "Screenwriter & Worldbuilder",
      quote: "Uploading my screenplay drafts and notes took 5 minutes. Now I can instantly check character ages, weapon descriptions, and magic rules without digging through random notebooks.",
      rating: 5,
      avatar: "SC"
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 bg-midnight-black z-20">
      
      {/* Subtle floating background circles */}
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full bg-soft-pink/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-soft-pink to-lavender-accent uppercase mb-3">
            Voices from the Sanctuary
          </h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Trusted by creators of worlds.
          </h3>
        </div>

        {/* Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.15 }}
              className="glass-panel p-8 rounded-3xl flex flex-col justify-between relative group hover:border-pink-500/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-8 text-purple-300/10">
                <Quote className="w-12 h-12 rotate-180" />
              </div>

              <div>
                {/* Rating stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-400 stroke-none" />
                  ))}
                </div>

                <p className="text-purple-200/70 text-sm font-light leading-relaxed mb-8 relative z-10 italic">
                  "{rev.quote}"
                </p>
              </div>

              {/* Author details */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-deep-purple-700 to-soft-pink flex items-center justify-center text-xs font-bold text-white shadow-md">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                  <p className="text-[10px] text-purple-300/40">{rev.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
