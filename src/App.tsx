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
  { id: '5', name: 'LG엔솔', code: '373220' },
  { id: '6', name: 'Apple', code: 'AAPL' },
  { id: '7', name: 'Vanguard S&P 500 ETF', code: 'VOO' },
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

const CountdownTimer = ({ 
  isLoggedIn, 
  onLogout 
}: { 
  isLoggedIn: boolean; 
  onLogout: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds

  useEffect(() => {
    if (!isLoggedIn) {
      setTimeLeft(60);
      return;
    }

    const handleActivity = () => setTimeLeft(60);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, [isLoggedIn, onLogout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
      <Clock className={cn("w-3.5 h-3.5 text-blue-600", isLoggedIn && "animate-pulse")} />
      <span className={cn(
        "text-[11px] font-black font-mono tabular-nums tracking-wider",
        timeLeft < 10 && isLoggedIn ? "text-rose-500" : "text-slate-700"
      )}>
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
      {type === 'overseas' && stock.code !== 'AAPL' && stock.code !== 'VOO' ? (
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
                  <span className="text-xs font-bold text-rose-500">{(price + (8-i) * (stock.code === 'AAPL' || stock.code === 'VOO' ? 0.5 : 100)).toLocaleString()}</span>
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
                  <span className="text-xs font-bold text-emerald-500">{(price - (i+1) * (stock.code === 'AAPL' || stock.code === 'VOO' ? 0.5 : 100)).toLocaleString()}</span>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Order Price ({stock.code === 'AAPL' || stock.code === 'VOO' ? 'USD' : 'KRW'})</label>
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
                    <span className="text-2xl font-black text-slate-900">{(price * Number(amount)).toLocaleString()} {stock.code === 'AAPL' || stock.code === 'VOO' ? 'USD' : 'KRW'}</span>
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
              <p className="text-3xl font-black text-white tracking-tight">
                {stock.code === 'AAPL' || stock.code === 'VOO' ? '45,210.00' : '125,480,000'} <span className="text-sm font-medium text-slate-500 ml-1">{stock.code === 'AAPL' || stock.code === 'VOO' ? 'USD' : 'KRW'}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'quant' | 'trade' | 'assets' | 'notice'>('quant');
  const [assetType, setAssetType] = useState<'domestic' | 'overseas'>('domestic');
  const [tradeType, setTradeType] = useState<'domestic' | 'overseas'>('domestic');
  const [quantType, setQuantType] = useState<'provided' | 'mine'>('provided');
  const [isAssetHovered, setIsAssetHovered] = useState(false);
  const [isTradeHovered, setIsTradeHovered] = useState(false);
  const [isQuantHovered, setIsQuantHovered] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const handleAutoLogout = () => {
    setIsLoggedIn(false);
    setShowLogoutMessage(true);
  };

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
            <div 
              className="relative"
              onMouseEnter={() => setIsQuantHovered(true)}
              onMouseLeave={() => setIsQuantHovered(false)}
            >
              <button 
                onClick={() => setActiveTab('quant')}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap h-full",
                  activeTab === 'quant' ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <Activity className="w-4 h-4" />
                퀀트 분석
              </button>

              <AnimatePresence>
                {isQuantHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setActiveTab('quant');
                        setQuantType('provided');
                        setIsQuantHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'quant' && quantType === 'provided') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      제공자료
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('quant');
                        setQuantType('mine');
                        setIsQuantHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'quant' && quantType === 'mine') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      나의자료
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

            <button 
              onClick={() => setActiveTab('notice')}
              className={cn(
                "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap relative",
                activeTab === 'notice' ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              )}
            >
              <Info className="w-4 h-4" />
              공지
              <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
            </button>
          </nav>

          <div className="flex items-center gap-6 ml-auto">
            <CountdownTimer isLoggedIn={isLoggedIn} onLogout={handleAutoLogout} />
            {isLoggedIn ? (
              <div className="flex items-center gap-5">
                <div className="text-right flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Premium Member</p>
                  <p className="text-[11px] font-bold text-slate-800 tracking-tight leading-tight">jackielee01100@gmail.com</p>
                  <button 
                    onClick={() => {
                      setIsLoggedIn(false);
                      setShowLogoutMessage(false);
                    }}
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
                onClick={() => {
                  setIsLoggedIn(true);
                  setShowLogoutMessage(false);
                }}
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
          {activeTab !== 'assets' && activeTab !== 'notice' && (
            <div className="flex items-center gap-4 mb-10">
              <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{selectedStock.name}</h1>
                <div className="w-px h-4 bg-slate-200" />
                <span className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">
                  {tradeType === 'overseas' || assetType === 'overseas' ? 'GLOBAL' : 'KOSPI'} {selectedStock.code}
                </span>
                {activeTab === 'quant' && (
                  <>
                    <div className="w-px h-4 bg-slate-200" />
                    <span className="text-blue-600 text-[11px] font-black tracking-widest uppercase">
                      {quantType === 'provided' ? '제공자료' : '나의자료'}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'assets' ? (
            <AssetView type={assetType} />
          ) : activeTab === 'trade' ? (
            <TradeView stock={selectedStock} price={chartData[chartData.length - 1]?.price || 0} type={tradeType} />
          ) : activeTab === 'notice' ? (
            <NoticeView />
          ) : (
            <QuantDashboard 
              stock={selectedStock}
              chartData={chartData}
              appliedScenarios={appliedScenarios}
              toggleScenario={toggleScenario}
              signals={signals}
            />
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

      <AnimatePresence>
        {showLogoutMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 right-10 z-[200] bg-rose-500 text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(244,63,94,0.3)] flex items-center gap-4 border border-rose-400/30 backdrop-blur-md"
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-sm tracking-tight">자동으로 로그아웃되었습니다.</p>
              <p className="text-[10px] font-bold text-rose-100 uppercase tracking-widest mt-0.5">1분간 활동이 없어 세션이 종료되었습니다.</p>
            </div>
            <button 
              onClick={() => setShowLogoutMessage(false)}
              className="ml-6 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all"
            >
              <Plus className="w-4 h-4 text-white rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QuantDashboard = ({ 
  stock, 
  chartData, 
  appliedScenarios, 
  toggleScenario,
  signals 
}: { 
  stock: Stock; 
  chartData: StockData[]; 
  appliedScenarios: string[]; 
  toggleScenario: (id: string) => void;
  signals: any[];
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stock Info Bar */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-4 ml-1">
            <span className="text-5xl font-black tracking-tighter text-slate-900">
              {chartData[chartData.length - 1]?.price.toLocaleString()}
              <span className="text-base font-bold text-slate-400 ml-2 tracking-widest">
                {stock.code === 'AAPL' || stock.code === 'VOO' ? 'USD' : 'KRW'}
              </span>
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
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Chart Area */}
        <div className="col-span-9 space-y-8">
          <div className="relative bg-white border border-slate-200 rounded-[3rem] h-[550px] transition-all flex flex-col shadow-2xl shadow-slate-100/50 overflow-hidden">
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
              <div className="ml-auto">
                <button className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] text-xs font-black tracking-[0.2em] uppercase shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95">
                  Build Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Selection Area (Analysis Tools integrated) */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-2xl shadow-slate-100/50 h-full">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Analysis Tools</h3>
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[440px] pr-2">
              {SCENARIOS.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => toggleScenario(s.id)}
                  className={cn(
                    "w-full text-left p-5 rounded-3xl transition-all border group",
                    appliedScenarios.includes(s.id) 
                      ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-200" 
                      : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                  )}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      appliedScenarios.includes(s.id) ? "bg-white/10" : "bg-slate-50"
                    )}>
                      {React.cloneElement(s.icon as React.ReactElement, { 
                        className: cn("w-6 h-6", appliedScenarios.includes(s.id) ? "text-white" : "text-blue-600") 
                      })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        "text-sm font-black tracking-tight leading-tight",
                        appliedScenarios.includes(s.id) ? "text-white" : "text-slate-900"
                      )}>{s.name}</p>
                    </div>
                  </div>
                  <p className={cn(
                    "text-[10px] font-bold leading-relaxed",
                    appliedScenarios.includes(s.id) ? "text-slate-300" : "text-slate-500"
                  )}>
                    {s.description}
                  </p>
                </button>
              ))}
              <button className="w-full p-6 border-4 border-dashed border-slate-50 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-blue-400 hover:border-blue-100 hover:bg-blue-50/10 transition-all group">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Strategy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetView = ({ type }: { type: 'domestic' | 'overseas' }) => {
  const assets = type === 'domestic' ? [
    { name: '삼성전자', code: '005930', q: 12, avgPrice: 68400, currPrice: 72100, profit: 5.4, currency: 'KRW' },
    { name: 'SK하이닉스', code: '000660', q: 8, avgPrice: 172000, currPrice: 184500, profit: 7.2, currency: 'KRW' },
    { name: '현대차', code: '035420', q: 5, avgPrice: 224000, currPrice: 218000, profit: -2.7, currency: 'KRW' },
  ] : [
    { name: 'Apple', code: 'AAPL', q: 25, avgPrice: 175.2, currPrice: 189.4, profit: 8.1, currency: 'USD' },
    { name: 'Vanguard S&P 500 ETF', code: 'VOO', q: 10, avgPrice: 420.5, currPrice: 462.8, profit: 10.0, currency: 'USD' },
  ];

  const currency = type === 'domestic' ? 'KRW' : 'USD';
  const totalValue = assets.reduce((acc, curr) => acc + (curr.currPrice * curr.q), 0);
  const totalProfit = assets.reduce((acc, curr) => acc + ((curr.currPrice - curr.avgPrice) * curr.q), 0);
  const availableCash = type === 'domestic' ? 125480000 : 45210;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-3 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Total Portfolio Value</h3>
          <p className="text-4xl font-black text-white tracking-tighter mb-4">{(totalValue + availableCash).toLocaleString()} <span className="text-sm font-bold text-slate-500 ml-1.5 uppercase tracking-widest italic font-mono">{currency}</span></p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              +{(totalProfit / totalValue * 100).toFixed(2)}% (+{totalProfit.toLocaleString()})
            </span>
            <span className="text-[9px] font-bold text-slate-600 italic">Across {assets.length} Positions</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Available Cash</h3>
          <p className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{availableCash.toLocaleString()} <span className="text-sm font-bold text-slate-400 ml-1.5 uppercase tracking-widest italic font-mono">{currency}</span></p>
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
                        {(asset.profit > 0 ? '+' : '-')}{Math.abs((asset.currPrice - asset.avgPrice) * asset.q).toLocaleString()} {asset.currency}
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

const NoticeView = () => {
  const notices = [
    {
      id: 1,
      title: "서비스 서버 점검 안내 (05/01 02:00~06:00)",
      content: "더욱 안정적인 퀀트 분석 서비스를 제공하기 위해 서버 점검을 진행합니다. 해당 시간에는 서비스 이용이 일시 중단되오니 양해 부탁드립니다.",
      date: "2024.04.24",
      category: "점검",
      isNew: true
    },
    {
      id: 2,
      title: "해외 주식 실시간 시세 제공 서비스 오픈",
      content: "미국 시장(NYSE, NASDAQ) 실시간 시세 제공 서비스가 정식 출시되었습니다. 이제 전 세계 주요 지수를 실시간 분석해 보세요.",
      date: "2024.04.22",
      category: "업데이트",
      isNew: false
    },
    {
      id: 3,
      title: "개인정보 처리방침 개정 안내",
      content: "개정된 법령에 따라 당사의 개인정보 처리방침이 변경되었습니다. 자세한 내용은 전문을 확인해 주시기 바랍니다.",
      date: "2024.04.15",
      category: "공지",
      isNew: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">서비스 공지사항</h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">QuantLab Service Notices & Updates</p>
      </div>

      <div className="space-y-6">
        {notices.map((notice) => (
          <motion.div 
            key={notice.id}
            whileHover={{ y: -4 }}
            className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <span className={cn(
                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                notice.category === "점검" ? "bg-rose-50 text-rose-500" : 
                notice.category === "업데이트" ? "bg-blue-50 text-blue-500" : "bg-slate-100 text-slate-500"
              )}>
                {notice.category}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{notice.date}</span>
              {notice.isNew && (
                <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">NEW</span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
              {notice.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {notice.content}
            </p>
            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
              <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                자세히 보기
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-8">
        <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-slate-300 hover:bg-blue-600 transition-all">
          더 많은 공지사항 보기
        </button>
      </div>
    </div>
  );
};
