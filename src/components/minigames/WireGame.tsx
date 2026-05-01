import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface WireNode {
  id: number;
  color: string;
}

export function WireGame({ onComplete }: { onComplete: (result: any) => void }) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500'];

  const [leftNodes] = useState<WireNode[]>(() => {
    return colors.map((c, i) => ({ id: i, color: c })).sort(() => Math.random() - 0.5);
  });

  const [rightNodes] = useState<WireNode[]>(() => {
    return colors.map((c, i) => ({ id: i, color: c })).sort(() => Math.random() - 0.5);
  });

  const [connections, setConnections] = useState<Record<number, number>>({});
  const [draggingFrom, setDraggingFrom] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingFrom === null || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
  };

  const startDrag = (leftId: number, e: React.PointerEvent) => {
    setDraggingFrom(leftId);
    handlePointerMove(e);
  };

  const endDragOnRight = (rightId: number) => {
    if (draggingFrom !== null) {
       setConnections(prev => ({ ...prev, [draggingFrom]: rightId }));
    }
    setDraggingFrom(null);
  };

  useEffect(() => {
    const handleUp = () => setDraggingFrom(null);
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, []);

  useEffect(() => {
    if (Object.keys(connections).length === 3) {
      // Check win
      let correct = 0;
      for (const [leftId, rightId] of Object.entries(connections)) {
         const leftColor = leftNodes.find(n => n.id === Number(leftId))?.color;
         const rightColor = rightNodes.find(n => n.id === rightId)?.color;
         if (leftColor === rightColor) correct++;
      }

      let tier = 'fail';
      if (correct === 3) tier = 'perfect';
      else if (correct > 0) tier = 'partial';

      setTimeout(() => onComplete({ tier }), 800);
    }
  }, [connections, leftNodes, rightNodes, onComplete]);

  // Quick helper to draw lines
  const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string) => {
     const length = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
     const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;
     return (
        <div
          className={cn("absolute h-3 rounded-full origin-left opacity-80 pointer-events-none", color)}
          style={{ width: length, left: x1, top: y1 - 6, transform: `rotate(${angle}deg)` }}
        />
     );
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 select-none font-sans touch-none" onPointerMove={handlePointerMove}>
      <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-widest italic">Splicer</h3>

      <div className="relative w-80 h-64 bg-zinc-900 border-2 border-zinc-700 rounded p-4" ref={containerRef}>
         <div className="absolute left-4 top-4 bottom-4 flex flex-col justify-between">
            {leftNodes.map((node, i) => {
               // roughly y = 24 + i * 80
               const yPos = 24 + i * (192 / 2);
               return (
                 <div key={`l-${node.id}`} className="relative flex items-center">
                   <div className="w-4 h-4 bg-zinc-600 rounded-sm -ml-4 mr-2" />
                   <div
                     className={cn("w-8 h-8 rounded-full border-2 border-zinc-950 cursor-pointer shadow-lg", node.color, connections[node.id] !== undefined && "opacity-50")}
                     onPointerDown={(e) => startDrag(node.id, e)}
                   />
                   {/* Draw active drag */}
                   {draggingFrom === node.id && drawLine(48, yPos, mousePos.x, mousePos.y, node.color)}
                   {/* Draw locked connection */}
                   {connections[node.id] !== undefined && (() => {
                      const rightIdx = rightNodes.findIndex(n => n.id === connections[node.id]);
                      const ryPos = 24 + rightIdx * (192 / 2);
                      return drawLine(48, yPos, 320 - 48, ryPos, node.color);
                   })()}
                 </div>
               );
            })}
         </div>

         <div className="absolute right-4 top-4 bottom-4 flex flex-col justify-between items-end">
            {rightNodes.map((node) => (
               <div key={`r-${node.id}`} className="relative flex items-center justify-end">
                 <div
                   className={cn("w-8 h-8 rounded-full border-2 border-zinc-950 cursor-crosshair shadow-lg", node.color)}
                   onPointerUp={() => endDragOnRight(node.id)}
                 />
                 <div className="w-4 h-4 bg-zinc-600 rounded-sm ml-2 -mr-4" />
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
