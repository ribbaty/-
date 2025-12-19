import React, { useState } from 'react';
import { DateIdea } from '../types';
import { Plus, X, Check, Minus } from 'lucide-react';

interface IdeaManagerProps {
  ideas: DateIdea[];
  setIdeas: React.Dispatch<React.SetStateAction<DateIdea[]>>;
  completedIdeas: DateIdea[];
  setCompletedIdeas: React.Dispatch<React.SetStateAction<DateIdea[]>>;
}

const COLORS = [
  '#E5E7EB', // Slate 200
  '#D1D5DB', // Slate 300
  '#E0E7FF', // Indigo 100
  '#F3E8FF', // Purple 100
  '#FAE8FF', // Pink 100
];

const IdeaManager: React.FC<IdeaManagerProps> = ({ ideas, setIdeas, completedIdeas, setCompletedIdeas }) => {
  const [inputText, setInputText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'done'>('pending');

  const handleAdd = () => {
    if (!inputText.trim()) return;
    const newIdea: DateIdea = {
      id: Date.now().toString(),
      text: inputText.trim(),
      color: COLORS[ideas.length % COLORS.length]
    };
    setIdeas([...ideas, newIdea]);
    setInputText('');
  };

  const handleRemove = (id: string, isCompleted: boolean) => {
    if (isCompleted) {
        setCompletedIdeas(completedIdeas.filter(i => i.id !== id));
    } else {
        setIdeas(ideas.filter(idea => idea.id !== id));
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex gap-10 mb-12">
        <button 
            onClick={() => setActiveSubTab('pending')}
            className={`text-[10px] tracking-[0.25em] uppercase pb-2 transition-all border-b ${activeSubTab === 'pending' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-200'}`}
        >
            ACTIVE ({ideas.length})
        </button>
        <button 
            onClick={() => setActiveSubTab('done')}
            className={`text-[10px] tracking-[0.25em] uppercase pb-2 transition-all border-b ${activeSubTab === 'done' ? 'border-slate-900 text-slate-900 font-bold' : 'border-transparent text-slate-200'}`}
        >
            DONE ({completedIdeas.length})
        </button>
      </div>

      {activeSubTab === 'pending' && (
        <div className="relative mb-12">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Share a new thought..."
                className="w-full bg-transparent border-b border-slate-100 py-5 text-sm focus:border-slate-900 outline-none transition-all placeholder:text-slate-200 text-slate-700"
            />
            <button
                onClick={handleAdd}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-900 transition-colors"
            >
                <Plus size={16} />
            </button>
        </div>
      )}

      <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-10">
        {activeSubTab === 'pending' ? (
            ideas.map((idea) => (
                <div key={idea.id} className="group flex items-start justify-between animate-in fade-in duration-700">
                    <div className="flex gap-4 items-center">
                        <div className="w-1.5 h-1.5 bg-slate-900 rounded-full shrink-0" />
                        <span className="text-slate-800 text-sm font-normal">{idea.text}</span>
                    </div>
                    <button onClick={() => handleRemove(idea.id, false)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-200 hover:text-slate-900">
                        <Minus size={14} />
                    </button>
                </div>
            ))
        ) : (
            completedIdeas.map((idea) => (
                <div key={idea.id} className="group flex items-start justify-between opacity-40 animate-in fade-in duration-700">
                    <div className="flex gap-4 items-center">
                        <Check size={12} className="shrink-0 text-slate-400" />
                        <span className="text-slate-500 text-sm font-normal line-through decoration-slate-200">{idea.text}</span>
                    </div>
                    <button onClick={() => handleRemove(idea.id, true)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-200 hover:text-slate-900">
                        <X size={14} />
                    </button>
                </div>
            ))
        )}
        
        {(activeSubTab === 'pending' ? ideas : completedIdeas).length === 0 && (
            <div className="py-24 text-center">
                <p className="text-[9px] tracking-[0.4em] uppercase text-slate-100 font-medium">Clearance</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default IdeaManager;