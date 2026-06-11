import { BookOpen, Sparkles, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-midnight-black border-t border-white/5 py-16 z-20 overflow-hidden">
      
      {/* Decorative side leaks */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-deep-purple-900/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Info column */}
          <div className="flex flex-col gap-4 text-left">
            <a href="#" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-deep-purple-700 to-soft-pink p-[1px]">
                <div className="w-full h-full rounded-full bg-deep-purple-950 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-lavender-accent" />
                </div>
                <div className="absolute -top-0.5 -right-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-wide text-white font-sans">
                Lore<span className="text-transparent bg-clip-text bg-gradient-to-r from-soft-pink to-lavender-accent">Keeper</span>
              </span>
            </a>
            
            <p className="text-xs text-purple-200/40 font-light leading-relaxed max-w-xs">
              A RAG-powered storytelling assistant keeping characters, bibles, and world rules in sync.
            </p>

            <div className="flex gap-4 mt-2">
              <a href="#" className="text-purple-300/40 hover:text-white transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-purple-300/40 hover:text-white transition-colors duration-300">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
              </a>
              <a href="#" className="text-purple-300/40 hover:text-white transition-colors duration-300">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>


          {/* Product links */}
          <div className="flex flex-col gap-3 text-left">
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-200/80">Product</h5>
            <a href="#features" className="text-xs text-purple-200/40 hover:text-white transition-colors">Features</a>
            <a href="#demo" className="text-xs text-purple-200/40 hover:text-white transition-colors">Workspace</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">API & Integrations</a>
          </div>

          {/* Resources links */}
          <div className="flex flex-col gap-3 text-left">
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-200/80">Resources</h5>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Lore Guides</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Writing Blog</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Help Center</a>
          </div>

          {/* Factions/Legal links */}
          <div className="flex flex-col gap-3 text-left">
            <h5 className="text-xs font-bold uppercase tracking-wider text-purple-200/80">Legal & Terms</h5>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Intellectual Property</a>
            <a href="#" className="text-xs text-purple-200/40 hover:text-white transition-colors">Security Codex</a>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-purple-300/30">
            © {new Date().getFullYear()} LoreKeeper. All rights reserved. Built with magic.
          </p>
          <div className="flex gap-4 text-[10px] text-purple-300/30">
            <span>Server status: online</span>
            <span>•</span>
            <span>Security version: lock-256</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
