import React, { useEffect, useRef, useState } from 'react';

export function PrecisionGame({ onComplete }: { onComplete: (result: any) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const startTime = useRef(performance.now());
  const [complete, setComplete] = useState(false);
  const [feedback, setFeedback] = useState<{ x: number, y: number, tier: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(8000);

  const targetRadius = 60; // Bronze ring size

  // Position tracks center of the target, 0 to 1 relative to container
  const posRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const loop = (time: number) => {
      if (complete) return;
      const elapsed = time - startTime.current;
      const remaining = Math.max(0, 8000 - elapsed);
      setTimeLeft(remaining);

      if (remaining === 0) {
        setComplete(true);
        setTimeout(() => onComplete({ tier: 'fail' }), 1000);
        return;
      }

      // Lissajous curve for unpredictable but smooth motion, speeding up
      const baseSpeed = 0.0015;
      const speedMult = 1 + (elapsed / 1000) * 0.1; // Speed increases once per second
      const speed = baseSpeed * speedMult;
      
      const xPhase = Math.sin(elapsed * speed) * Math.cos(elapsed * speed * 0.7);
      const yPhase = Math.cos(elapsed * speed * 1.2) * Math.sin(elapsed * speed * 0.4);
      
      posRef.current.x = 0.5 + xPhase * 0.4;
      posRef.current.y = 0.5 + yPhase * 0.4;
      
      if (targetRef.current && containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        targetRef.current.style.transform = `translate(
          ${posRef.current.x * bounds.width - targetRadius}px, 
          ${posRef.current.y * bounds.height - targetRadius}px
        )`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [complete, onComplete]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (complete) return;
    if (!containerRef.current || !targetRef.current) return;
    setComplete(true);
    cancelAnimationFrame(rafRef.current);

    const bounds = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - bounds.left;
    const clickY = e.clientY - bounds.top;

    const targetX = posRef.current.x * bounds.width;
    const targetY = posRef.current.y * bounds.height;

    const dist = Math.sqrt(Math.pow(clickX - targetX, 2) + Math.pow(clickY - targetY, 2));
    
    let tier = 'fail';
    if (dist <= 15) tier = 'gold'; // Bullseye
    else if (dist <= 35) tier = 'silver'; // Mid ring
    else if (dist <= 60) tier = 'bronze'; // Outer ring
    
    setFeedback({ x: clickX, y: clickY, tier });
    
    setTimeout(() => onComplete({ tier }), 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full h-[60vh] font-sans relative">
      <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-widest text-center italic">Dead Reckoning</h3>
      <div className="text-amber-500 font-mono mb-6 pb-2 w-full text-center tracking-widest text-lg border-b border-zinc-800">
        {(timeLeft / 1000).toFixed(2)} SEC
      </div>
      
      <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="relative w-full max-w-lg aspect-square bg-zinc-950 border border-zinc-700 rounded-xl overflow-hidden cursor-crosshair touch-none shadow-inner"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+Cjwvc3ZnPg==')] opacity-50 pointer-events-none" />
        
        {/* The Target */}
        <div
          ref={targetRef}
          className="absolute top-0 left-0 rounded-full flex items-center justify-center will-change-transform shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-amber-900/40 border-2 border-amber-800/80"
          style={{ width: targetRadius * 2, height: targetRadius * 2 }}
        >
          {/* Silver Ring */}
          <div className="absolute w-[70px] h-[70px] rounded-full border-2 border-zinc-400/80 bg-zinc-500/20" />
          {/* Gold Bullseye */}
          <div className="absolute w-[30px] h-[30px] rounded-full border-2 border-amber-400 bg-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
        </div>

        {/* Feedback Click Marker */}
        {feedback && (
          <div 
            className={`absolute rounded-full border-2 w-6 h-6 ml-[-12px] mt-[-12px] animate-ping ${feedback.tier === 'gold' ? 'border-amber-400' : feedback.tier === 'silver' ? 'border-zinc-300' : feedback.tier === 'bronze' ? 'border-amber-700' : 'border-red-500'}`}
            style={{ left: feedback.x, top: feedback.y }}
          />
        )}
      </div>

      {feedback && (
        <div className={`mt-6 text-xl font-black uppercase tracking-widest px-6 py-2 border rounded ${feedback.tier === 'gold' ? 'text-amber-400 border-amber-400/50 bg-amber-400/10' : feedback.tier === 'silver' ? 'text-zinc-300 border-zinc-400/50 bg-zinc-400/10' : feedback.tier === 'bronze' ? 'text-amber-700 border-amber-700/50 bg-amber-700/10' : 'text-red-500 border-red-500/50 bg-red-500/10'}`}>
          {feedback.tier === 'fail' ? 'MISS' : `${feedback.tier.toUpperCase()} STRIKE`}
        </div>
      )}
    </div>
  );
}
