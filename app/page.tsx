import { Clock } from "@/components/Clock";
import { Player } from "@/components/Player";
import { LiveListeners } from "@/components/LiveListeners";

const YOUTUBE_MUSIC_PLAYLIST_URL = "https://youtube.com/playlist?list=PLINILDQsbSsM&si=aPljaVRYYpl3sD1a";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden">
      
      {/* Background with overlay */}
      <div className="fixed inset-0 -z-20 hero-bg bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Grain overlay */}
      <div 
        className="fixed inset-0 -z-10 opacity-30 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Top Row */}
      <div 
        className="w-full flex items-center justify-between z-10"
        style={{
          paddingTop: 'max(1rem, env(safe-area-inset-top))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div className="flex-1">
          <Clock />
        </div>
        
        <div className="flex-1 text-center flex flex-col items-center">
          <LiveListeners />
        </div>
        
        <div className="flex-1 flex justify-end gap-3 text-white/80 pr-2">
          <a 
            href={YOUTUBE_MUSIC_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Open playlist on YouTube Music" 
            className="hover:text-white transition-colors flex items-center justify-center group"
          >
            {/* Simple YouTube Music style play-circle glyph */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="group-hover:scale-110 transition-transform">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* Center Text */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 w-full px-4 text-center -mt-16 md:-mt-32">
        <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl tracking-wide">
          शॉवर टाइम
        </h1>
      </div>

      {/* Spacer to push player to bottom */}
      <div className="flex-1" />

      {/* Bottom Row - Player */}
      <div 
        className="w-full z-10 relative"
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <Player />
      </div>

    </main>
  );
}
