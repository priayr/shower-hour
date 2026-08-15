"use client";

import { useEffect, useState } from "react";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-emerald-500"
];

const generateAvatars = (count: number) => {
  const avatars = [];
  const displayCount = Math.min(count, 3);
  for (let i = 0; i < displayCount; i++) {
    avatars.push({
      id: i,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length]
    });
  }
  return avatars;
};

export function LiveListeners() {
  const [listeners, setListeners] = useState(42);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Simulate real-time drift every 5-15 seconds
    const scheduleNextUpdate = () => {
      const delay = Math.floor(Math.random() * 10000) + 5000;
      return setTimeout(() => {
        setListeners((prev) => {
          const change = Math.floor(Math.random() * 7) - 3;
          // Ensure we don't drop to 0, always have at least 1 listener
          const next = Math.max(1, prev + (change === 0 ? 1 : change));
          return next;
        });
        timeoutId = scheduleNextUpdate();
      }, delay);
    };

    let timeoutId = scheduleNextUpdate();
    return () => clearTimeout(timeoutId);
  }, []);

  // Trigger a subtle fade effect when the number changes
  useEffect(() => {
    setFade(true);
    const t = setTimeout(() => setFade(false), 300);
    return () => clearTimeout(t);
  }, [listeners]);

  const avatars = generateAvatars(listeners);
  const extraCount = Math.max(0, listeners - avatars.length);

  return (
    <div className="flex items-center gap-2.5 text-xs font-medium text-white/80 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-sm hover:bg-white/10 transition-colors">
      
      {/* Avatars Stack */}
      <div className="flex items-center -space-x-1">
        {avatars.map((avatar, i) => (
          <div 
            key={avatar.id} 
            className={`w-[18px] h-[18px] rounded-full ${avatar.color} border-[1.5px] border-black/20 ring-1 ring-white/20 flex items-center justify-center shadow-sm relative z-${30 - i * 10}`}
            style={{ zIndex: 10 - i }} // Ensure correct stacking order
          />
        ))}
        {extraCount > 0 && (
          <div 
            className="w-[18px] h-[18px] rounded-full bg-white/10 border-[1.5px] border-black/20 ring-1 ring-white/20 flex items-center justify-center text-[8px] backdrop-blur-md text-white/90 relative z-0"
            style={{ zIndex: 0 }}
          >
            +{extraCount > 99 ? '99' : extraCount}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-l border-white/10 pl-2.5">
        {/* Pulse Indicator */}
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:hidden"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
        </span>
        
        {/* Count text with subtle fade transition */}
        <div className="whitespace-nowrap tabular-nums">
          <span className={`transition-opacity duration-300 ${fade ? 'opacity-30' : 'opacity-100'}`}>
            {listeners}
          </span>
          <span className="ml-1 opacity-90">
            {listeners === 1 ? 'listening now' : 'listening now'}
          </span>
        </div>
      </div>
    </div>
  );
}
