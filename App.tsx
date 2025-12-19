import React, { useState, useEffect } from 'react';
import SpinWheel from './components/SpinWheel';
import IdeaManager from './components/IdeaManager';
import AISuggestion from './components/AISuggestion';
import { DateIdea, TabView, WheelMode } from './types';
import { Sparkles, History, LayoutGrid } from 'lucide-react';

const STORAGE_KEY = 'spark-v5';

// 聚焦于“今天”可以做的、非同居、无“约会”字眼的行为池
const SYSTEM_POOL = [
    "味觉挑战：去超市买三种从未吃过的零食回来盲测",
    "瞬间捕手：互相为对方拍一张以“笑容”为主题的抓拍",
    "盲盒指南：抛硬币决定在下个路口左转还是右转",
    "书海寻踪：在最近的书店给对方挑一本想读的书",
    "反向点餐：晚饭点餐时完全由对方决定你吃什么",
    "落日追踪：找一个视野开阔的地方，一起看完整的日落",
    "时光寄语：给一年后的对方写一张现在不能看的明信片",
    "自然呼吸：去最近的公园坐着听10分钟大自然的声音",
    "河边晚风：散步时分享一件今天让你觉得小确幸的事",
    "甜度测试：去奶茶店尝试一种从未点过的怪味配方",
    "心跳快闪：在接下来的10分钟内，为对方准备一个5元的小惊喜",
    "摄影比赛：寻找街道上最有烟火气的角落，看谁拍得更有感",
    "云端投影：今晚同步看同一部电影，结束后视频语音分享",
    "旧地重游：带对方去一个你小时候常去的“秘密基地”",
    "人生剧场：观察路人，一起脑补他们的职业和背后故事",
    "博物馆日：去最近的展馆看场不需要预约的小众展览",
    "歌单交换：互相把对方最近单曲循环最多的歌完整听一遍",
    "街头觅食：寻找一家名字听起来最奇怪或有趣的街边小吃",
    "愿望清单：各自说出一件想和对方一起去做的冒险尝试",
    "突击探班：在对方忙碌结束后的出口给一个结实的拥抱",
    "平行时空：如果不做现在的工作，你最想体验什么人生？",
    "深夜谈心：打一个长长的电话，只聊那些不切实际的梦想",
    "反差挑战：穿一件平时你绝对不会穿的风格去见对方",
    "运动瞬间：相约去附近的操场慢跑15分钟或练习拉伸",
    "文创收集：在路过的店里找一个能代表今天记忆的小物件",
    "理想之屋：一起构思如果未来住在一起，客厅必须有的三样东西",
    "审美挑战：去文具店选一张你觉得最符合对方气质的贴纸",
    "灵魂拷问：问一个关于对方成长背景中转折点的问题",
    "记忆搜寻：分享一个你手机里对你意义重大但不常给人看的照片",
    "光影实验：寻找一处有霓虹灯的地方，拍一组电影感合影",
    "即兴动作：在没人注意的地方，一起做一套搞怪的自创动作",
    "技能交换：现场教对方一个你擅长的冷门小技能",
    "秘密路线：带对方走一条你私藏的、风景最好的步行路",
    "味觉盲盒：买两瓶不同品牌的同类饮料进行盲测对比",
    "生活碎片：一起去花卉市场买一束应季的鲜花分给对方",
    "致敬经典：模仿一张经典电影海报里的动作现场合影"
];

const COLORS = [
  '#E5E7EB', '#D1D5DB', '#E0E7FF', '#F3E8FF', '#FAE8FF', '#FCE7F3', '#FEF3C7', '#ECFDF5',
];

const shuffle = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateSystemIdeas = (): DateIdea[] => {
    const shuffledPool = shuffle(SYSTEM_POOL);
    return shuffledPool.slice(0, 8).map((text, i) => ({
        id: `sys-${i}-${Date.now()}-${Math.random()}`,
        text,
        color: COLORS[i % COLORS.length]
    }));
};

const INITIAL_IDEAS: DateIdea[] = [
  { id: '1', text: '今日限定：一起去山顶看一次完整的日落', color: '#E0E7FF' },
  { id: '2', text: '探店计划：去那家收藏很久但一直没机会去的餐厅', color: '#FAE8FF' },
];

function App() {
  // 惰性初始化：确保刷新时不会因为 INITIAL_IDEAS 的短暂存在而导致数据被覆盖
  const [ideas, setIdeas] = useState<DateIdea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.ideas)) {
          return parsed.ideas;
        }
      }
    } catch (e) {
      console.error("加载自定义内容失败:", e);
    }
    return INITIAL_IDEAS;
  });

  const [completedIdeas, setCompletedIdeas] = useState<DateIdea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.completed)) {
          return parsed.completed;
        }
      }
    } catch (e) {
      console.error("加载历史记录失败:", e);
    }
    return [];
  });

  const [systemIdeas, setSystemIdeas] = useState<DateIdea[]>(generateSystemIdeas());
  const [wheelMode, setWheelMode] = useState<WheelMode>(WheelMode.SYSTEM);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.WHEEL);

  // 实时同步到本地存储
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ideas, completed: completedIdeas }));
  }, [ideas, completedIdeas]);

  // 当切换到系统模式或转盘停止时，刷新系统内容，保持新鲜感
  useEffect(() => {
    if (wheelMode === WheelMode.SYSTEM && !isSpinning) {
        setSystemIdeas(generateSystemIdeas());
    }
  }, [wheelMode, isSpinning]);

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