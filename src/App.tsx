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
  Plus
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

const TradeView = ({ stock, price }: { stock: Stock; price: number }) => {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('0');
  
  return (
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
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'quant' | 'trade'>('quant');
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]);
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)]">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-800">QuantLab</h1>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('quant')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                activeTab === 'quant' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <Layers className="w-4 h-4" />
              퀀트 분석
            </button>
            <button 
              onClick={() => setActiveTab('trade')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all",
                activeTab === 'trade' ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <Zap className="w-4 h-4" />
              주식 구매
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar bg-slate-50/30">
          {activeTab === 'quant' ? (
            <>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Quant Scenarios
                </h2>
              </div>
              {SCENARIOS.map(s => (
                <ScenarioItem 
                  key={s.id} 
                  scenario={s} 
                  onApply={toggleScenario}
                  isApplied={appliedScenarios.includes(s.id)}
                />
              ))}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  My Holdings
                </h2>
              </div>
              {STOCKS.slice(0, 3).map(stock => (
                <div key={stock.id} className="p-4 mb-3 border border-slate-200 bg-white rounded-xl shadow-sm flex justify-between items-center group hover:border-blue-400 transition-all cursor-pointer" onClick={() => setSelectedStock(stock)}>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{stock.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">14주 보유</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-500">+4.2%</p>
                    <p className="text-[10px] text-slate-300">평단 48,200</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 leading-relaxed text-center">
            {activeTab === 'quant' ? "Drag a scenario to apply it." : "Select a stock to start trading."}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header/Nav */}
        <header className="h-20 border-b border-slate-100 flex items-center justify-between px-10 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search stocks..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  {filteredStocks.map(stock => (
                    <button
                      key={stock.id}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSearchQuery('');
                      }}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700">{stock.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono tracking-wider">{stock.code}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
              {['1D', '1W', '1M', '1Y'].map(t => (
                <button 
                  key={t}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-black rounded-md transition-all",
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
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {/* Stock Info Bar */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <h1 className="text-xl font-black text-slate-800">{selectedStock.name}</h1>
                  <span className="text-slate-400 text-sm font-mono tracking-wider">{selectedStock.code}.KS</span>
                </div>
              </div>
              <div className="flex items-baseline gap-4 ml-1">
                <span className="text-4xl font-black tracking-tight text-slate-900">
                  {chartData[chartData.length - 1]?.price.toLocaleString()}
                  <span className="text-lg font-medium text-slate-400 ml-1.5">KRW</span>
                </span>
                <span className={cn(
                  "text-sm font-bold flex items-center gap-1",
                  (chartData[chartData.length - 1]?.price > chartData[0]?.price) ? "text-emerald-500" : "text-rose-500"
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
                        className="w-12 h-12 rounded-full border-[3px] border-[#F8FAFC] flex items-center justify-center shadow-xl shadow-slate-200 cursor-help group relative z-10 hover:-translate-y-1 transition-transform"
                        style={{ backgroundColor: s.color }}
                        title={s.name}
                      >
                        {React.cloneElement(s.icon as React.ReactElement, { className: 'w-5 h-5 text-white' })}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl z-50">
                          {s.name} Active
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
                "relative bg-white border border-slate-200 rounded-[2.5rem] h-[550px] transition-all flex flex-col shadow-sm overflow-hidden",
                isOverDropZone && "border-blue-400 ring-8 ring-blue-50/50"
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
                    className="absolute inset-0 z-30 flex items-center justify-center bg-blue-50/60 backdrop-blur-[2px] pointer-events-none"
                  >
                    <div className="bg-white p-12 rounded-full border-4 border-dashed border-blue-400 shadow-2xl animate-in zoom-in-75 duration-300">
                      <Plus className="w-16 h-16 text-blue-500" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chart Area */}
              <div className="flex-1 p-10 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tick={{ fontWeight: 600 }}
                    />
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      orientation="right"
                      domain={['auto', 'auto']}
                      tick={{ fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        borderColor: '#E2E8F0',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#1E293B' }}
                    />
                    
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      animationDuration={2000}
                    />

                    {appliedScenarios.includes('ma-cross') && (
                      <>
                        <Line type="monotone" dataKey="ma5" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="6 6" />
                        <Line type="monotone" dataKey="ma20" stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                      </>
                    )}

                    {signals.map((sig, i) => (
                      <ReferenceDot 
                        key={i}
                        x={sig.x} 
                        y={sig.y} 
                        r={6} 
                        fill="white" 
                        stroke={sig.color} 
                        strokeWidth={3}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Analytics Bar */}
              <div className="h-24 border-t border-slate-100 bg-slate-50/80 flex items-center px-10 gap-16 backdrop-blur-sm">
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Backtest Accuracy</p>
                  <p className="text-xl font-black text-slate-800">74.2% <span className="text-xs font-medium text-slate-400 ml-1">vs Mkt</span></p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Profit Factor</p>
                  <p className="text-xl font-black text-slate-800">1.82</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1.5">Active Signals</p>
                  <p className="text-xl font-black text-slate-800">{signals.length}</p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <span className="text-xs text-slate-400 italic font-medium">Applied to full watchlist?</span>
                  <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black tracking-widest uppercase shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                    Execute Portfolio
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <TradeView stock={selectedStock} price={chartData[chartData.length - 1]?.price || 0} />
          )}

          {/* Bottom Meta */}
          <footer className="mt-8 flex justify-between text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
            <div className="flex gap-10">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Real-time Data Active
              </span>
              <span>Server Latency: 14ms</span>
            </div>
            <div className="flex gap-10">
              <span>Quant Engine v4.2.1-stable</span>
              <span className="text-slate-300">Updated: {format(new Date(), 'yyyy.MM.dd HH:mm:ss')}</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
