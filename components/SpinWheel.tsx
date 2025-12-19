import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { DateIdea, WheelMode } from '../types';
import { Sparkles, ArrowRight, Lightbulb, Triangle } from 'lucide-react';

interface SpinWheelProps {
  items: DateIdea[];
  mode: WheelMode;
  onConfirm: (winner: DateIdea) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ items, mode, onConfirm, isSpinning, setIsSpinning }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<DateIdea | null>(null);

  const canSpin = items.length >= 2;
  const size = 320; 
  const center = size / 2;
  const wheelRadius = (size / 2) - 10;

  const pie = d3.pie<DateIdea>().value(1).sort(null);
  const arcs = pie(items);
  
  const arcGenerator = d3.arc<d3.PieArcDatum<DateIdea>>()
    .innerRadius(45) 
    .outerRadius(wheelRadius)
    .padAngle(0.01) 
    .cornerRadius(2);

  const handleSpin = () => {
    if (isSpinning || !canSpin) return;
    setWinner(null);
    setIsSpinning(true);

    const minSpins = 12; 
    const randomDegree = Math.floor(Math.random() * 360);
    const newRotation = rotation + (360 * minSpins) + randomDegree;

    setRotation(newRotation);

    const finalAngle = newRotation % 360; 
    const winningAngle = (360 - finalAngle) % 360;
    const winningRad = (winningAngle * Math.PI) / 180;

    const winningArc = arcs.find(d => winningRad >= d.startAngle && winningRad < d.endAngle);
    
    setTimeout(() => {
      setIsSpinning(false);
      if (winningArc) {
        setWinner(winningArc.data);
      }
    }, 2000); 
  };

  const parseWinnerContent = (text: string) => {
    const parts = text.split(/[：:]/);
    if (parts.length > 1) {
      return { theme: parts[0].trim(), detail: parts.slice(1).join('：').trim() };
    }
    return { theme: 'Spark Moment', detail: text };
  };

  return (
    <div className="flex flex-col items-center justify-center relative w-full">
      <div className="relative mb-16 select-none">
        {/* 指示器 */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <Triangle className="w-5 h-5 text-slate-800 fill-slate-800 rotate-180" />
        </div>

        {/* 优雅转盘主体 */}
        <div 
          className="relative rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] bg-white p-1.5" 
          style={{ width: size, height: size }}
        >
          <div 
              className="w-full h-full rounded-full overflow-hidden"
              style={{ 
                  transition: 'transform 2.2s cubic-bezier(0.1, 0, 0.1, 1)', 
                  transform: `rotate(${rotation}deg)`
              }}
          >
            <svg 
              ref={svgRef} 
              width="100%" 
              height="100%" 
              viewBox={`0 0 ${size} ${size}`}
              className="block overflow-visible"
            >
              <g transform={`translate(${center},${center})`}>
                {arcs.map((arc, i) => (
                  <path 
                      key={items[i].id}
                      d={arcGenerator(arc) || undefined} 
                      fill={items[i].color}
                      stroke="#fff" 
                      strokeWidth="2"
                      className="transition-all duration-300"
                  />
                ))}
              </g>

              {/* 轴心 */}
              <circle cx={center} cy={center} r="48" fill="white" className="shadow-sm" />
              <circle cx={center} cy={center} r="44" fill="white" stroke="#F8FAFC" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning || !canSpin}
        className={`
            group relative px-20 py-4 rounded-full text-sm font-medium tracking-[0.4em] transition-all duration-700
            ${isSpinning || !canSpin 
                ? 'text-slate-200' 
                : 'text-slate-900 hover:text-slate-400'
            }
        `}
      >
        <span className="relative z-10 uppercase">{isSpinning ? 'Resonating' : 'Begin'}</span>
        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-slate-100 transition-all duration-500 ${isSpinning ? 'w-0' : 'group-hover:w-12'}`}></div>
      </button>

      {/* 极简结果弹窗 */}
      {winner && !isSpinning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-white/95 backdrop-blur-md animate-in fade-in duration-700" onClick={() => setWinner(null)}></div>
            
            <div className="relative p-8 md:p-12 max-w-[440px] w-full animate-in zoom-in-95 slide-in-from-bottom-6 duration-700 text-center">
                
                <div className="inline-block mb-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">
                        {parseWinnerContent(winner.text).theme}
                    </span>
                </div>
                
                <h2 className="text-3xl font-normal text-slate-900 leading-snug tracking-tight mb-20 px-4">
                    {parseWinnerContent(winner.text).detail}
                </h2>
                
                <div className="flex flex-col gap-5 max-w-[280px] mx-auto">
                    <button 
                        onClick={() => { onConfirm(winner); setWinner(null); }}
                        className="w-full py-5 bg-slate-900 text-white rounded-full text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-slate-700 transition-all duration-500"
                    >
                        Accept Challenge
                    </button>
                    
                    <button 
                        onClick={() => setWinner(null)}
                        className="w-full py-2 text-slate-300 text-[9px] font-medium uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
                    >
                        Release
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SpinWheel;