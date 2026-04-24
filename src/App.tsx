import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceDot
} from 'recharts';
import { 
  TrendingUp, 
  Search, 
  Layers, 
  Activity, 
  BarChart3, 
  Zap, 
  ChevronRight,
  Info,
  RefreshCw,
  Plus,
  LogIn,
  Wallet,
  User,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, subDays, addDays } from 'date-fns';

/**
 * Utility for Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface StockData {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  ma5?: number;
  ma20?: number;
  rsi?: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface Stock {
  id: string;
  name: string;
  code: string;
}

// --- Constants ---

const SCENARIOS: Scenario[] = [
  {
    id: 'ma-cross',
    name: '이동평균선 골든크로스',
    description: '단기 이평선(5일)이 장기 이평선(20일)을 상향 돌파할 때 매수 신호',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#3B82F6'
  },
  {
    id: 'rsi-oversold',
    name: 'RSI 과매도 반등',
    description: 'RSI 지표가 30 이하로 내려갔다가 다시 상승할 때 기술적 반등 포착',
    icon: <Activity className="w-4 h-4" />,
    color: '#10B981'
  },
  {
    id: 'volume-spike',
    name: '거래량 폭발',
    description: '평균 거래량 대비 200% 이상 기록 시 추세 전환 가능성 확인',
    icon: <Zap className="w-4 h-4" />,
    color: '#F59E0B'
  },
  {
    id: 'bollinger',
    name: '볼린저 밴드 하단',
    description: '주가가 볼린저 밴드 하단에 도달하여 지지선을 형성하는 구간',
    icon: <Layers className="w-4 h-4" />,
    color: '#8B5CF6'
  }
];

const STOCKS: Stock[] = [
  { id: '1', name: '삼성전자', code: '005930' },
  { id: '2', name: 'SK하이닉스', code: '000660' },
  { id: '3', name: 'NAVER', code: '035420' },
  { id: '4', name: '현대차', code: '005380' },
  { id: '5', name: 'LG에너지솔루션', code: '373220' },
];

// --- Mock Data Generator ---

const generateMockData = (stockId: string): StockData[] => {
  const data: StockData[] = [];
  let basePrice = 50000 + Math.random() * 100000;
  if (stockId === '1') basePrice = 75000;
  if (stockId === '2') basePrice = 180000;

  const startDate = subDays(new Date(), 60);

  for (let i = 0; i < 60; i++) {
    const date = addDays(startDate, i);
    const volatility = basePrice * 0.02;
    const change = (Math.random() - 0.5) * volatility;
    basePrice += change;

    data.push({
      date: format(date, 'MM/dd'),
      price: Math.round(basePrice),
      open: Math.round(basePrice - (Math.random() * volatility * 0.5)),
      high: Math.round(basePrice + (Math.random() * volatility * 0.5)),
      low: Math.round(basePrice - (Math.random() * volatility * 0.5)),
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
  }

  // Calculate indicators
  return data.map((item, idx, arr) => {
    // MA 5
    let ma5 = undefined;
    if (idx >= 4) {
      ma5 = Math.round(arr.slice(idx - 4, idx + 1).reduce((acc, curr) => acc + curr.price, 0) / 5);
    }

    // MA 20
    let ma20 = undefined;
    if (idx >= 19) {
      ma20 = Math.round(arr.slice(idx - 19, idx + 1).reduce((acc, curr) => acc + curr.price, 0) / 20);
    }

    // Rough RSI estimation
    const rsi = 30 + Math.random() * 40;

    return { ...item, ma5, ma20, rsi };
  });
};

// --- Components ---

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const handleActivity = () => setTimeLeft(600);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
      <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
      <span className="text-[11px] font-black text-slate-700 font-mono tabular-nums tracking-wider">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};

const ScenarioItem = ({ 
  scenario, 
  onApply, 
  isApplied 
}: { 
  scenario: Scenario; 
  onApply: (id: string) => void;
  isApplied: boolean;
  key?: string;
}) => {
  return (
    <motion.div
      layoutId={scenario.id}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.4}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      className={cn(
        "p-4 mb-3 border bg-white rounded-xl cursor-grab active:cursor-grabbing group transition-all shadow-sm",
        isApplied ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/10" : "border-slate-200 hover:border-blue-400 hover:shadow-md"
      )}
      onClick={() => onApply(scenario.id)}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" 
          style={{ backgroundColor: `${scenario.color}10`, color: scenario.color }}
        >
          {scenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate">{scenario.name}</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {scenario.description}
          </p>
        </div>
        {isApplied && (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: scenario.color }}
          >
            <Zap className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TradeView = ({ stock, price, type }: { stock: Stock; price: number; type: 'domestic' | 'overseas' }) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('0');
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {type === 'overseas' ? (
        <div className="flex flex-col items-center justify-center h-full py-20 bg-white border border-slate-200 rounded-[3rem] shadow-sm animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
            <Zap className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">해외 주식 거래 준비 중...</h2>
          <p className="text-slate-400 font-bold tracking-tight">곧 해외 주식 구매 서비스가 시작됩니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8 h-full">
          {/* Order Book Section */}
          <div className="col-span-4 bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col shadow-sm">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Order Book</h3>
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
              {[...Array(8)].map((_, i) => (
                <div key={`ask-${i}`} className="flex items-center justify-between py-1 px-3 bg-rose-50/30 rounded-lg group hover:bg-rose-50 transition-colors relative">
                  <span className="text-xs font-bold text-rose-500">{(price + (8-i) * 100).toLocaleString()}</span>
                  <span className="text-[10px] font-mono text-slate-400">{Math.floor(Math.random() * 5000)}</span>
                  <div className="absolute right-0 top-0 bottom-0 bg-rose-500/5 transition-all" style={{ width: `${Math.random() * 40}%` }} />
                </div>
              ))}
              <div className="py-4 border-y border-slate-100 my-4 text-center">
                <span className="text-xl font-black text-slate-900">{price.toLocaleString()}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Market Price</p>
              </div>
              {[...Array(8)].map((_, i) => (
                <div key={`bid-${i}`} className="flex items-center justify-between py-1 px-3 bg-emerald-50/30 rounded-lg group hover:bg-emerald-50 transition-colors">
                  <span className="text-xs font-bold text-emerald-500">{(price - (i+1) * 100).toLocaleString()}</span>
                  <span className="text-[10px] font-mono text-slate-400">{Math.floor(Math.random() * 5000)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction Section */}
          <div className="col-span-8 space-y-8 flex flex-col">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm flex-1">
              <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl mb-8 w-fit">
                <button 
                  onClick={() => setOrderType('buy')}
                  className={cn(
                    "px-10 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all",
                    orderType === 'buy' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-200" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Buy
                </button>
                <button 
                  onClick={() => setOrderType('sell')}
                  className={cn(
                    "px-10 py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all",
                    orderType === 'sell' ? "bg-rose-500 text-white shadow-xl shadow-rose-200" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Sell
                </button>
              </div>

              <div className="space-y-8 max-w-md">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Order Price (KRW)</label>
                  <input 
                    type="text" 
                    value={price.toLocaleString()} 
                    readOnly
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-2xl font-black text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Quantity</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-2xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">주</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-slate-400">Estimated Total</span>
                    <span className="text-2xl font-black text-slate-900">{(price * Number(amount)).toLocaleString()} KRW</span>
                  </div>
                  <button 
                    className={cn(
                      "w-full py-6 rounded-3xl text-sm font-black tracking-[0.2em] uppercase shadow-2xl transition-all active:scale-95",
                      orderType === 'buy' ? "bg-emerald-500 text-white shadow-emerald-200 hover:bg-emerald-600" : "bg-rose-500 text-white shadow-rose-200 hover:bg-rose-600"
                    )}
                  >
                    Place {orderType} Order
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Balance</h4>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-3xl font-black text-white tracking-tight">125,480,000 <span className="text-sm font-medium text-slate-500 ml-1">KRW</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'quant' | 'trade' | 'assets'>('quant');
  const [assetType, setAssetType] = useState<'domestic' | 'overseas'>('domestic');
  const [tradeType, setTradeType] = useState<'domestic' | 'overseas'>('domestic');
  const [isAssetHovered, setIsAssetHovered] = useState(false);
  const [isTradeHovered, setIsTradeHovered] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setChartData(generateMockData(selectedStock.id));
  }, [selectedStock]);

  const toggleScenario = (scenarioId: string) => {
    setAppliedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId) 
        : [...prev, scenarioId]
    );
  };

  const filteredStocks = useMemo(() => 
    STOCKS.filter(s => 
      s.name.includes(searchQuery) || s.code.includes(searchQuery)
    ), [searchQuery]);

  const signals = useMemo(() => {
    const result: { x: string; y: number; label: string; color: string }[] = [];
    
    if (appliedScenarios.includes('ma-cross')) {
      chartData.forEach((d, i) => {
        if (i > 0 && d.ma5 && d.ma20 && chartData[i-1].ma5 && chartData[i-1].ma20) {
          // Cross Up (Golden Cross)
          if (chartData[i-1].ma5! <= chartData[i-1].ma20! && d.ma5! > d.ma20!) {
            result.push({ x: d.date, y: d.price, label: 'GOLDEN', color: '#10B981' });
          }
        }
      });
    }

    if (appliedScenarios.includes('rsi-oversold')) {
      chartData.forEach((d) => {
        // Mocking RSI signals for demo
        if (d.rsi && d.rsi < 35) {
          result.push({ x: d.date, y: d.price, label: 'OVERSOLD', color: '#3B82F6' });
        }
      });
    }

    return result;
  }, [chartData, appliedScenarios]);

  const handleDrop = (scenarioId: string) => {
    if (!appliedScenarios.includes(scenarioId)) {
      setAppliedScenarios(prev => [...prev, scenarioId]);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-500">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER NAVIGATION */}
        <header className="h-24 border-b border-slate-100 flex items-center justify-between px-10 bg-white/90 backdrop-blur-xl z-50">
          <div className="flex items-center gap-2 mr-10 min-w-[120px]">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-lg font-black tracking-tighter italic whitespace-nowrap">QUANT<span className="text-blue-600">LAB</span></h1>
          </div>

          <nav className="flex items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-[1.25rem] border border-slate-200/50">
            <button 
              onClick={() => setActiveTab('quant')}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap",
                activeTab === 'quant' ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              )}
            >
              <Activity className="w-4 h-4" />
              퀀트 분석
            </button>
            <div 
              className="relative"
              onMouseEnter={() => setIsTradeHovered(true)}
              onMouseLeave={() => setIsTradeHovered(false)}
            >
              <button 
                onClick={() => setActiveTab('trade')}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap h-full",
                  activeTab === 'trade' ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <Zap className="w-4 h-4" />
                주식 구매
              </button>

              <AnimatePresence>
                {isTradeHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setActiveTab('trade');
                        setTradeType('domestic');
                        setIsTradeHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'trade' && tradeType === 'domestic') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      국내 주식
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('trade');
                        setTradeType('overseas');
                        setIsTradeHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'trade' && tradeType === 'overseas') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      해외 주식
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div 
              className="relative"
              onMouseEnter={() => setIsAssetHovered(true)}
              onMouseLeave={() => setIsAssetHovered(false)}
            >
              <button 
                onClick={() => setActiveTab('assets')}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap h-full",
                  activeTab === 'assets' ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <Wallet className="w-4 h-4" />
                내 자산
              </button>

              <AnimatePresence>
                {isAssetHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setActiveTab('assets');
                        setAssetType('domestic');
                        setIsAssetHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'assets' && assetType === 'domestic') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      국내 주식
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('assets');
                        setAssetType('overseas');
                        setIsAssetHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'assets' && assetType === 'overseas') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      해외 주식
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-6 ml-auto">
            <CountdownTimer />
            {isLoggedIn ? (
              <div className="flex items-center gap-5">
                <div className="text-right flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Premium Member</p>
                  <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">jackielee01100@gmail.com</p>
                  <button 
                    onClick={() => setIsLoggedIn(false)}
                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors text-right mt-1 w-fit ml-auto"
                  >
                    Logout
                  </button>
                </div>
                <button 
                  className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm group"
                >
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="flex items-center gap-3 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black tracking-[0.2em] uppercase shadow-2xl shadow-slate-300 hover:bg-blue-600 hover:-translate-y-1 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Log In
              </button>
            )}
          </div>
        </header>

        {/* SUBSIDIARY SEARCH/TIME BAR */}
        {activeTab !== 'assets' && (
          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-10 bg-white/50 backdrop-blur-md">
            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search stocks..."
                className="w-full bg-slate-100/50 border border-slate-200/50 rounded-xl py-2 pl-11 pr-4 text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase tracking-wider"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="absolute top-full left-0 w-full mt-3 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                  {filteredStocks.map(stock => (
                    <button
                      key={stock.id}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSearchQuery('');
                      }}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-800">{stock.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-widest bg-slate-100 px-2 py-0.5 rounded uppercase">{stock.code}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              <div className="flex gap-1.5 bg-slate-200/50 p-1 rounded-xl">
                {['1D', '1W', '1M', '1Y'].map(t => (
                  <button 
                    key={t}
                    className={cn(
                      "px-4 py-1.5 text-[9px] font-black rounded-lg transition-all tracking-widest",
                      t === '1W' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <button 
                onClick={() => {
                  setAppliedScenarios([]);
                  setChartData(generateMockData(selectedStock.id));
                }}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
          {activeTab === 'assets' ? (
            <AssetView type={assetType} />
          ) : activeTab === 'trade' ? (
            <TradeView stock={selectedStock} price={chartData[chartData.length - 1]?.price || 0} type={tradeType} />
          ) : (
            <>
              {/* Stock Info Bar */}
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">{selectedStock.name}</h1>
                      <div className="w-px h-4 bg-slate-200" />
                      <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">KOSPI {selectedStock.code}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-4 ml-1">
                    <span className="text-5xl font-black tracking-tighter text-slate-900">
                      {chartData[chartData.length - 1]?.price.toLocaleString()}
                      <span className="text-base font-bold text-slate-400 ml-2 tracking-widest">KRW</span>
                    </span>
                    <span className={cn(
                      "text-sm font-black flex items-center gap-1.5 px-3 py-1 rounded-lg",
                      (chartData[chartData.length - 1]?.price > chartData[0]?.price) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    )}>
                      {(chartData[chartData.length - 1]?.price > chartData[0]?.price) ? "+" : ""}
                      {(chartData[chartData.length - 1]?.price - chartData[0]?.price).toLocaleString()} 
                      ({((chartData[chartData.length - 1]?.price / chartData[0]?.price - 1) * 100).toFixed(2)}%)
                      {(chartData[chartData.length - 1]?.price > chartData[0]?.price) ? <TrendingUp className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 rotate-90" />}
                    </span>
                  </div>
                </div>

                {activeTab === 'quant' && (
                  <div className="flex -space-x-3">
                    <AnimatePresence>
                      {appliedScenarios.map(id => {
                        const s = SCENARIOS.find(x => x.id === id);
                        return s ? (
                          <motion.div
                            key={id}
                            initial={{ scale: 0.5, opacity: 0, x: 20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            exit={{ scale: 0.5, opacity: 0, x: 20 }}
                            className="w-14 h-14 rounded-3xl border-[4px] border-[#F8FAFC] flex items-center justify-center shadow-2xl shadow-slate-200 cursor-help group relative z-10 hover:-translate-y-1 transition-transform"
                            style={{ backgroundColor: s.color }}
                          >
                            {React.cloneElement(s.icon as React.ReactElement, { className: 'w-6 h-6 text-white' })}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-[0.2em] uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-[100]">
                              {s.name} Applied
                            </div>
                          </motion.div>
                        ) : null;
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {activeTab === 'quant' ? (
                <div 
                  className={cn(
                    "relative bg-white border border-slate-200 rounded-[3rem] h-[600px] transition-all flex flex-col shadow-2xl shadow-slate-100/50 overflow-hidden",
                    isOverDropZone && "border-blue-400 ring-[20px] ring-blue-50/50"
                  )}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setIsOverDropZone(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDragLeave={() => {
                    setIsOverDropZone(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsOverDropZone(false);
                    if (appliedScenarios.length < SCENARIOS.length) {
                      const next = SCENARIOS.find(s => !appliedScenarios.includes(s.id));
                      if (next) handleDrop(next.id);
                    }
                  }}
                >
                  {/* Visual indicator for drop zone when dragging */}
                  <AnimatePresence>
                    {isOverDropZone && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center bg-blue-600/10 backdrop-blur-xl pointer-events-none"
                      >
                        <div className="bg-white p-20 rounded-full border-[6px] border-dashed border-blue-600 shadow-[0_32px_64px_rgba(37,99,235,0.2)] animate-in zoom-in-75 duration-500">
                          <Plus className="w-24 h-24 text-blue-600" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Chart Area */}
                  <div className="flex-1 p-12 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" stroke="#F1F5F9" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#94A3B8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fontWeight: 800 }}
                        />
                        <YAxis 
                          stroke="#94A3B8" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          orientation="right"
                          domain={['auto', 'auto']}
                          tick={{ fontWeight: 800 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FFFFFF', 
                            borderColor: '#E2E8F0',
                            borderRadius: '24px',
                            padding: '16px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                            border: 'none'
                          }}
                          itemStyle={{ color: '#1E293B' }}
                        />
                        
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#2563EB" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                          animationDuration={2500}
                        />

                        {appliedScenarios.includes('ma-cross') && (
                          <>
                            <Line type="monotone" dataKey="ma5" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="10 5" isAnimationActive={false} />
                            <Line type="monotone" dataKey="ma20" stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="8 8" isAnimationActive={false} />
                          </>
                        )}

                        {signals.map((sig, i) => (
                          <ReferenceDot 
                            key={i}
                            x={sig.x} 
                            y={sig.y} 
                            r={8} 
                            fill="white" 
                            stroke={sig.color} 
                            strokeWidth={4}
                            className="drop-shadow-lg"
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Analytics Bar */}
                  <div className="h-28 border-t border-slate-100 bg-slate-50/50 flex items-center px-12 gap-20 backdrop-blur-md">
                    <div className="group cursor-help">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2 group-hover:text-blue-600 transition-colors">Backtest Score</p>
                      <p className="text-2xl font-black text-slate-900">74.2% <span className="text-xs font-bold text-emerald-500 ml-1.5">WIN RATE</span></p>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2">Alpha Ratio</p>
                      <p className="text-2xl font-black text-slate-900">1.82 <span className="text-[10px] font-bold text-slate-400 ml-1.5 italic">PF</span></p>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-2">Signal Load</p>
                      <p className="text-2xl font-black text-slate-900">{signals.length} <span className="text-xs font-bold text-blue-600 ml-1.5 uppercase">Hits</span></p>
                    </div>
                    <div className="ml-auto flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Execution Mode</p>
                        <p className="text-xs text-blue-600 font-black italic uppercase">Automated Strategy Only</p>
                      </div>
                      <button className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black tracking-[0.2em] uppercase shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95">
                        Build Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}

          {/* Bottom Meta */}
          <footer className="mt-10 flex justify-between text-[10px] text-slate-400 uppercase tracking-[0.3em] font-black italic">
            <div className="flex gap-12">
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                Live Data Synchronized
              </span>
              <span>Latency: 14.02ms</span>
            </div>
            <div className="flex gap-12">
              <span className="text-slate-300">CORE v4.8.2-R1</span>
              <span>Updated: {format(new Date(), 'yyyy.MM.dd HH:mm:ss')}</span>
            </div>
          </footer>
        </div>
      </main>

      {/* Sidebar: Now on the Right */}
      <aside className={cn(
        "bg-white border-l border-slate-200 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-500 ease-in-out",
        activeTab === 'quant' ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden border-0"
      )}>
        <div className="p-8 border-b border-slate-100 bg-white whitespace-nowrap">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Analysis Tools
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar bg-slate-50/50">
          <div className="flex flex-col gap-2">
            {SCENARIOS.map(s => (
              <ScenarioItem 
                key={s.id} 
                scenario={s} 
                onApply={toggleScenario}
                isApplied={appliedScenarios.includes(s.id)}
              />
            ))}
            <button className="mt-4 w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">시나리오 추가</span>
            </button>
          </div>
        </div>

        <div className="p-8 bg-white border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Drag & Drop signals directly into the chart workspace.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

const AssetView = ({ type }: { type: 'domestic' | 'overseas' }) => {
  if (type === 'overseas') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 bg-white border border-slate-200 rounded-[3rem] shadow-sm animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
          <Wallet className="w-10 h-10 text-blue-600 opacity-20" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">해외 주식 내역이 없습니다</h2>
        <p className="text-slate-400 font-bold tracking-tight">글로벌 시장 투자를 시작해보세요.</p>
        <button className="mt-8 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
          거래소 연결하기
        </button>
      </div>
    );
  }

  const assets = [
    { name: '삼성전자', code: '005930', q: 12, avgPrice: 68400, currPrice: 72100, profit: 5.4 },
    { name: 'SK하이닉스', code: '000660', q: 8, avgPrice: 172000, currPrice: 184500, profit: 7.2 },
    { name: '현대차', code: '035420', q: 5, avgPrice: 224000, currPrice: 218000, profit: -2.7 },
  ];

  const totalValue = assets.reduce((acc, curr) => acc + (curr.currPrice * curr.q), 0);
  const totalProfit = assets.reduce((acc, curr) => acc + ((curr.currPrice - curr.avgPrice) * curr.q), 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Total Portfolio Value</h3>
          <p className="text-4xl font-black text-white tracking-tighter mb-4">{(totalValue + 125480000).toLocaleString()} <span className="text-sm font-bold text-slate-500 ml-1.5 uppercase tracking-widest italic font-mono">KRW</span></p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              +{(totalProfit / totalValue * 100).toFixed(2)}% (+{totalProfit.toLocaleString()})
            </span>
            <span className="text-[9px] font-bold text-slate-600 italic">Across 3 Positions</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Available Cash</h3>
          <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">125,480,000 <span className="text-sm font-bold text-slate-400 ml-1.5 uppercase tracking-widest italic font-mono">KRW</span></p>
          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all">Deposit</button>
            <button className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all">Withdraw</button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 flex flex-col justify-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Portfolio Diversity</p>
          <div className="flex items-center justify-center gap-1.5 h-10">
            <div className="w-12 h-4 bg-blue-600 rounded-full" />
            <div className="w-6 h-4 bg-purple-500 rounded-full" />
            <div className="w-4 h-4 bg-emerald-500 rounded-full" />
          </div>
          <p className="text-[11px] font-black text-slate-900 mt-4 uppercase">Technology Optimized</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/20">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Positions</h3>
            <button className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">Trade History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Price</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.code} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className={cn("w-5 h-5", asset.profit > 0 ? "text-emerald-500" : "text-rose-500")} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">{asset.name}</p>
                            <p className="text-[10px] font-mono font-bold text-slate-400 tracking-widest uppercase">{asset.code}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-sm font-bold text-slate-900">{asset.q}주</td>
                  <td className="px-6 py-6 text-sm font-mono font-bold text-slate-600">{asset.avgPrice.toLocaleString()}</td>
                  <td className="px-6 py-6 text-sm font-mono font-bold text-slate-900">{asset.currPrice.toLocaleString()}</td>
                  <td className="px-6 py-6 text-right">
                    <span className={cn(
                        "text-sm font-black italic",
                        asset.profit > 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                        {asset.profit > 0 ? '▲' : '▼'} {Math.abs(asset.profit)}%
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                        {(asset.profit > 0 ? '+' : '-')}{Math.abs((asset.currPrice - asset.avgPrice) * asset.q).toLocaleString()} KRW
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
