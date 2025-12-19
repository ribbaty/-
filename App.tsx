import React, { useState, useEffect } from 'react';
import SpinWheel from './components/SpinWheel';
import IdeaManager from './components/IdeaManager';
import AISuggestion from './components/AISuggestion';
import { DateIdea, TabView, WheelMode } from './types';
import { Sparkles, History, LayoutGrid } from 'lucide-react';

const SYSTEM_POOL = [
    "冷知识交换：分享一个只有你才知道的奇怪冷知识",
    "平行时空：如果现在有无限资金，最想去哪里开启第二人生？",
    "技能互换：教对方一个你拿手的小动作或小技能",
    "脑洞实验室：如果我们共同创业，最想做一个什么样的产品？",
    "情绪垃圾桶：吐槽一件不爽的小事，对方只需静静倾听",
    "审美碰撞：分享一段音乐，说出它打动你的那个瞬间",
    "避雷指南：互相坦诚一个绝对不能踩的社交雷点",
    "成就互吹：认真地夸奖对方一个你一直佩服的优点",
    "未来快进：想象10年后的我们，各自会有什么改变？",
    "手机断舍离：接下来的20分钟，放下手机进行面对面交流",
    "盲盒探店：打开地图随机选一个没去过的店，今天就去那里",
    "人生清单：各自说出3件这辈子必做的清单项",
    "播客时刻：一起听一段深度访谈片段，分享受启发的点",
    "反向挑战：去做一件平时觉得“傻”的事",
    "空间改造：如果共同装饰房间，你会选什么配色和风格？",
    "真心话：问对方一个你好奇已久但一直没开口的问题"
];

// 优化后的莫兰迪配色方案，提升视觉对比度
const COLORS = [
  '#E5E7EB', // Slate 200
  '#D1D5DB', // Slate 300
  '#E0E7FF', // Indigo 100
  '#F3E8FF', // Purple 100
  '#FAE8FF', // Pink 100
  '#FCE7F3', // Rose 100
  '#FEF3C7', // Amber 100
  '#ECFDF5', // Emerald 50
];

const shuffle = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const generateSystemIdeas = (): DateIdea[] => {
    const shuffledPool = shuffle([...SYSTEM_POOL]);
    return shuffledPool.slice(0, 8).map((text, i) => ({
        id: `sys-${i}-${Date.now()}`,
        text,
        color: COLORS[i % COLORS.length]
    }));
};

const INITIAL_IDEAS: DateIdea[] = [
  { id: '1', text: '去山顶看一次云海', color: '#E0E7FF' },
  { id: '2', text: '共同完成一幅油画', color: '#FAE8FF' },
];

function App() {
  const [ideas, setIdeas] = useState<DateIdea[]>(INITIAL_IDEAS);
  const [completedIdeas, setCompletedIdeas] = useState<DateIdea[]>([]);
  const [systemIdeas, setSystemIdeas] = useState<DateIdea[]>(generateSystemIdeas());
  const [wheelMode, setWheelMode] = useState<WheelMode>(WheelMode.SYSTEM);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.WHEEL);

  useEffect(() => {
    if (wheelMode === WheelMode.SYSTEM && !isSpinning) {
        setSystemIdeas(generateSystemIdeas());
    }
  }, [wheelMode]);

  useEffect(() => {
    const saved = localStorage.getItem('spark-v5');
    if (saved) {
      const { ideas, completed } = JSON.parse(saved);
      setIdeas(ideas || INITIAL_IDEAS);
      setCompletedIdeas(completed || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('spark-v5', JSON.stringify({ ideas, completed: completedIdeas }));
  }, [ideas, completedIdeas]);

  const handleConfirmResult = (winner: DateIdea) => {
    if (wheelMode === WheelMode.CUSTOM) {
        setIdeas(prev => prev.filter(item => item.id !== winner.id));
        setCompletedIdeas(prev => [winner, ...prev]);
    } else {
        const historyItem = { ...winner, id: `history-${Date.now()}` };
        setCompletedIdeas(prev => [historyItem, ...prev]);
        setSystemIdeas(generateSystemIdeas());
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* 桌面端导航 */}
      <nav className="hidden md:flex flex-col w-20 border-r border-slate-100 items-center py-12 z-20">
        <div className="mb-20">
            <div className="w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
        </div>
        <div className="flex flex-col gap-12">
            <button onClick={() => setActiveTab(TabView.WHEEL)} className={`transition-all duration-300 ${activeTab === TabView.WHEEL ? 'text-slate-900' : 'text-slate-200 hover:text-slate-400'}`}><LayoutGrid size={20} strokeWidth={1.5} /></button>
            <button onClick={() => setActiveTab(TabView.LIST)} className={`transition-all duration-300 ${activeTab === TabView.LIST ? 'text-slate-900' : 'text-slate-200 hover:text-slate-400'}`}><History size={20} strokeWidth={1.5} /></button>
            <button onClick={() => setActiveTab(TabView.AI)} className={`transition-all duration-300 ${activeTab === TabView.AI ? 'text-slate-900' : 'text-slate-200 hover:text-slate-400'}`}><Sparkles size={20} strokeWidth={1.5} /></button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row relative">
        {/* 转盘区域 */}
        <div className={`
            flex-1 flex flex-col items-center justify-center p-8 transition-all duration-700
            ${activeTab === TabView.WHEEL ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0 md:relative'}
        `}>
             <header className="absolute top-12 text-center">
                <h1 className="text-[10px] font-medium tracking-[0.6em] text-slate-300 uppercase mb-4">Internal Connection</h1>
                <div className="flex gap-8 justify-center">
                    <button 
                        onClick={() => setWheelMode(WheelMode.SYSTEM)} 
                        disabled={isSpinning} 
                        className={`text-[11px] tracking-[0.25em] transition-all duration-300 pb-1 border-b ${wheelMode === WheelMode.SYSTEM ? 'text-slate-900 border-slate-900 font-bold' : 'text-slate-200 border-transparent'}`}
                    >
                        INSPIRE
                    </button>
                    <button 
                        onClick={() => setWheelMode(WheelMode.CUSTOM)} 
                        disabled={isSpinning} 
                        className={`text-[11px] tracking-[0.25em] transition-all duration-300 pb-1 border-b ${wheelMode === WheelMode.CUSTOM ? 'text-slate-900 border-slate-900 font-bold' : 'text-slate-200 border-transparent'}`}
                    >
                        CUSTOM
                    </button>
                </div>
             </header>

             <SpinWheel 
                items={wheelMode === WheelMode.SYSTEM ? systemIdeas : ideas} 
                isSpinning={isSpinning}
                setIsSpinning={setIsSpinning}
                onConfirm={handleConfirmResult}
                mode={wheelMode}
             />
        </div>

        {/* 内容面板 */}
        <div className={`
            flex-1 bg-white md:border-l border-slate-50 p-12 md:p-20 overflow-y-auto no-scrollbar transition-all duration-700
            ${activeTab !== TabView.WHEEL ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none absolute inset-0 md:relative'}
            md:max-w-xl w-full mx-auto
        `}>
            <div className="max-w-md mx-auto h-full flex flex-col">
                <header className="mb-16">
                    <h2 className="text-2xl font-normal tracking-tight text-slate-900 mb-2">
                        {activeTab === TabView.LIST && 'Archive'}
                        {activeTab === TabView.AI && 'Laboratory'}
                    </h2>
                    <div className="w-6 h-[1px] bg-slate-100"></div>
                </header>

                <div className="flex-1">
                    {activeTab === TabView.LIST && (
                        <IdeaManager 
                            ideas={ideas} 
                            setIdeas={setIdeas} 
                            completedIdeas={completedIdeas}
                            setCompletedIdeas={setCompletedIdeas}
                        />
                    )}
                    {activeTab === TabView.AI && (
                        <AISuggestion ideas={ideas} setIdeas={setIdeas} />
                    )}
                </div>
            </div>
        </div>
      </main>

      {/* 移动端导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-50 py-6 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab(TabView.LIST)} className={`transition-all ${activeTab === TabView.LIST ? 'text-slate-900' : 'text-slate-200'}`}><History size={18} strokeWidth={1.5} /></button>
        <button onClick={() => setActiveTab(TabView.WHEEL)} className={`transition-all ${activeTab === TabView.WHEEL ? 'text-slate-900' : 'text-slate-200'}`}><LayoutGrid size={22} strokeWidth={1.5} /></button>
        <button onClick={() => setActiveTab(TabView.AI)} className={`transition-all ${activeTab === TabView.AI ? 'text-slate-900' : 'text-slate-200'}`}><Sparkles size={18} strokeWidth={1.5} /></button>
      </nav>
    </div>
  );
}

export default App;