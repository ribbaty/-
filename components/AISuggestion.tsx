import React, { useState } from 'react';
import { DateIdea } from '../types';
import { generateDateIdeas } from '../services/geminiService';
import { Sparkles, Plus, ArrowUpRight } from 'lucide-react';

interface AISuggestionProps {
  ideas: DateIdea[];
  setIdeas: React.Dispatch<React.SetStateAction<DateIdea[]>>;
}

const COLORS = ['#F8FAFC', '#F1F5F9', '#E2E8F0'];

const MOODS = [
    { label: "Romantic", value: "极致浪漫且有仪式感" },
    { label: "Quiet", value: "安静、深思、放松的活动" },
    { label: "Playful", value: "充满童心和欢笑的趣味活动" },
    { label: "Explorer", value: "户外、自然、未知的冒险" },
];

const AISuggestion: React.FC<AISuggestionProps> = ({ ideas, setIdeas }) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeMood, setActiveMood] = useState<string | null>(null);

  const handleGenerate = async (mood: string, label: string) => {
    setActiveMood(label);
    setLoading(true);
    setSuggestions([]);
    
    const newSuggestions = await generateDateIdeas(mood, 3);
    setSuggestions(newSuggestions);
    setLoading(false);
  };

  const addSuggestion = (text: string) => {
    const newIdea: DateIdea = {
        id: Date.now().toString() + Math.random(),
        text,
        color: COLORS[ideas.length % COLORS.length]
    };
    setIdeas(prev => [...prev, newIdea]);
    setSuggestions(prev => prev.filter(s => s !== text));
  };

  return (
    <div className="h-full flex flex-col font-light">
        <div className="mb-16">
             <div className="grid grid-cols-2 gap-3">
                {MOODS.map((mood) => (
                    <button
                        key={mood.label}
                        onClick={() => handleGenerate(mood.value, mood.label)}
                        disabled={loading}
                        className={`
                            py-4 px-6 rounded-2xl text-[10px] tracking-[0.2em] uppercase transition-all duration-500 border
                            ${activeMood === mood.label 
                                ? 'bg-slate-900 text-white border-slate-900' 
                                : 'bg-transparent text-slate-400 border-slate-50 hover:border-slate-200'
                            }
                        `}
                    >
                        {mood.label}
                    </button>
                ))}
             </div>
        </div>

        {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 animate-pulse">
                <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-slate-300">Resonating...</p>
            </div>
        ) : suggestions.length > 0 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {suggestions.map((text, idx) => (
                    <div 
                        key={idx} 
                        className="group flex items-center justify-between py-6 border-b border-slate-50 cursor-pointer hover:border-slate-200 transition-all"
                        onClick={() => addSuggestion(text)}
                    >
                        <span className="text-slate-600 text-sm">{text}</span>
                        <ArrowUpRight className="text-slate-200 group-hover:text-slate-900 transition-colors" size={16} />
                    </div>
                ))}
            </div>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-100 py-20">
                <Sparkles size={40} strokeWidth={0.5} className="mb-6 opacity-20" />
                <p className="text-[10px] uppercase tracking-[0.3em]">Choose a resonance</p>
             </div>
        )}
    </div>
  );
};

export default AISuggestion;