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
  Clock,
  ArrowRight,
  ArrowUpDown,
  LayoutGrid,
  MoreVertical,
  ChevronDown,
  Calendar,
  Filter
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
  createdAt: string;
  popularity: number;
}

interface Stock {
  id: string;
  name: string;
  code: string;
  type: 'domestic' | 'overseas';
}

// --- Constants ---

const SCENARIOS: Scenario[] = [
  {
    id: 'ma-cross',
    name: '이동평균선 골든크로스',
    description: '단기 이평선(5일)이 장기 이평선(20일)을 상향 돌파할 때 매수 신호',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#3B82F6',
    createdAt: '2026-04-23',
    popularity: 95
  },
  {
    id: 'rsi-oversold',
    name: 'RSI 과매도 반등',
    description: 'RSI 지표가 30 이하로 내려갔다가 다시 상승할 때 기술적 반등 포착',
    icon: <Activity className="w-4 h-4" />,
    color: '#10B981',
    createdAt: '2026-04-21',
    popularity: 88
  },
  {
    id: 'volume-spike',
    name: '거래량 폭발',
    description: '평균 거래량 대비 200% 이상 기록 시 추세 전환 가능성 확인',
    icon: <Zap className="w-4 h-4" />,
    color: '#F59E0B',
    createdAt: '2026-03-10',
    popularity: 76
  },
  {
    id: 'bollinger',
    name: '볼린저 밴드 하단',
    description: '주가가 볼린저 밴드 하단에 도달하여 지지선을 형성하는 구간',
    icon: <Layers className="w-4 h-4" />,
    color: '#8B5CF6',
    createdAt: '2026-04-05',
    popularity: 92
  }
];

const STOCKS: Stock[] = [
  { id: '1', name: '삼성전자', code: '005930', type: 'domestic' },
  { id: '2', name: 'SK하이닉스', code: '000660', type: 'domestic' },
  { id: '3', name: 'NAVER', code: '035420', type: 'domestic' },
  { id: '4', name: '현대차', code: '005380', type: 'domestic' },
  { id: '5', name: 'LG엔솔', code: '373220', type: 'domestic' },
  { id: '6', name: 'Apple', code: 'AAPL', type: 'overseas' },
  { id: '7', name: 'Vanguard S&P 500 ETF', code: 'VOO', type: 'overseas' },
  { id: '8', name: 'KODEX 200', code: '069500', type: 'domestic' },
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

const TradeView = ({ 
  stock, 
  price, 
  type,
  balance,
  ownedShares,
  cashKRW
}: { 
  stock: Stock; 
  price: number; 
  type: 'domestic' | 'overseas';
  balance: number;
  ownedShares: number;
  cashKRW: number;
}) => {
  const [orderTab, setOrderTab] = useState<'buy' | 'sell'>('buy');
  const [orderPrice, setOrderPrice] = useState<number>(price);
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const currency = (stock.code === 'AAPL' || stock.code === 'VOO') ? 'USD' : 'KRW';
  const isDomestic = type === 'domestic';

  const orderBook = useMemo(() => {
    const asks = [];
    for (let i = 8; i >= 1; i--) {
      asks.push({
        price: price + i * (isDomestic ? 100 : 0.05),
        volume: Math.floor(Math.random() * 5000),
        ratio: Math.random() * 100
      });
    }
    const bids = [];
    for (let i = 1; i <= 8; i++) {
      bids.push({
        price: price - i * (isDomestic ? 100 : 0.05),
        volume: Math.floor(Math.random() * 5000),
        ratio: Math.random() * 100
      });
    }
    return { asks, bids };
  }, [price, isDomestic]);

  const estimatedTotal = orderPrice * quantity;

  const handlePlaceOrder = () => {
    if (quantity <= 0) {
      setError('주문 수량을 입력하세요');
      alert('주문 수량을 입력하세요');
      return;
    }

    if (orderTab === 'buy') {
      if (estimatedTotal > balance) {
        setError('구매 가능 금액이 부족합니다');
        alert(`구매 가능 금액이 부족합니다.\n가능 금액: ${balance.toLocaleString()} ${currency}\n주문 금액: ${estimatedTotal.toLocaleString()} ${currency}`);
        return;
      }
      setError(null);
      alert(`${stock.name} ${quantity}주 매수 주문이 완료되었습니다.`);
    } else {
      if (quantity > ownedShares) {
        setError('보유 수량이 부족합니다');
        alert(`가진 주 이상 더 판매할 수 없다.\n보유 수량: ${ownedShares}주\n주문 수량: ${quantity}주`);
        return;
      }
      setError(null);
      alert(`${stock.name} ${quantity}주 매도 주문이 완료되었습니다.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 animate-in fade-in slide-in-from-right-4 duration-700 overflow-y-auto custom-scrollbar">
      {/* Search and Top Info */}
      <div className="p-10 pb-0">
        <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Search Stocks...</span>
            </div>
        </div>

        <div className="flex items-center gap-6">
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">
            {price.toLocaleString()} <span className="text-2xl font-bold text-slate-400 font-mono tracking-normal">{currency}</span>
          </h2>
          <div className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 shadow-sm shadow-rose-200/50">
            <span className="text-sm font-black">-1,363(-1.81%)</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-wrap lg:flex-nowrap p-10 gap-10">
        {/* Left: Order Book Card */}
        <div className="flex-1 min-w-[400px] bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Book</h3>
          </div>
          
          <div className="flex-1 flex flex-col">
            {/* Ask Prices */}
            <div className="space-y-1 mb-8">
              {orderBook.asks.map((ask, i) => (
                <div key={`ask-${i}`} className="group relative flex items-center justify-between py-2 px-6 rounded-xl hover:bg-slate-50 transition-all cursor-pointer overflow-hidden">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-rose-50/50 transition-all" 
                    style={{ width: `${ask.ratio}%` }}
                  />
                  <span className="relative text-xs font-black text-rose-500 z-10">{ask.price.toLocaleString()}</span>
                  <span className="relative text-[10px] font-bold text-slate-400 z-10">{ask.volume.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Current Price Divider */}
            <div className="py-10 border-y border-slate-50 text-center my-6 flex flex-col items-center justify-center">
              <p className="text-4xl font-black text-slate-900 tracking-tight">{price.toLocaleString()}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Market Price</p>
            </div>

            {/* Bid Prices */}
            <div className="space-y-1">
              {orderBook.bids.map((bid, i) => (
                <div key={`bid-${i}`} className="group relative flex items-center justify-between py-2 px-6 rounded-xl hover:bg-slate-50 transition-all cursor-pointer overflow-hidden">
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-emerald-50/50 transition-all" 
                    style={{ width: `${bid.ratio}%` }}
                  />
                  <span className="relative text-xs font-black text-emerald-500 z-10">{bid.price.toLocaleString()}</span>
                  <span className="relative text-[10px] font-bold text-slate-400 z-10">{bid.volume.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Form Card */}
        <div className="flex-1 min-w-[400px] flex flex-col gap-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm flex flex-col">
            {/* Buy/Sell Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] mb-12">
              <button 
                onClick={() => setOrderTab('buy')}
                className={cn(
                  "flex-1 py-4 text-[12px] font-black uppercase tracking-widest rounded-[1.25rem] transition-all",
                  orderTab === 'buy' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/30" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Buy
              </button>
              <button 
                onClick={() => setOrderTab('sell')}
                className={cn(
                  "flex-1 py-4 text-[12px] font-black uppercase tracking-widest rounded-[1.25rem] transition-all",
                  orderTab === 'sell' ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Sell
              </button>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {orderTab === 'buy' ? 'Purchasable' : 'Holdings'}
                </span>
                <span className="text-xs font-black text-slate-700">
                  {orderTab === 'buy' ? `${balance.toLocaleString()} ${currency}` : `${ownedShares}주`}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Order Price ({currency})</p>
                <div className="relative">
                  <input 
                    type="text" 
                    value={orderPrice.toLocaleString()}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-8 px-10 text-3xl font-black text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quantity</p>
                <div className="relative">
                  <input 
                    type="number" 
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => {
                      setQuantity(Number(e.target.value));
                      if (error) setError(null);
                    }}
                    placeholder="0"
                    className={cn(
                      "w-full bg-slate-50 border rounded-[2rem] py-8 px-10 text-xl sm:text-2xl md:text-3xl font-black text-slate-900 focus:outline-none placeholder:text-slate-900 break-all",
                      error ? "border-rose-500 ring-4 ring-rose-500/10" : "border-slate-100"
                    )}
                  />
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 uppercase tracking-widest">주</span>
                </div>
                <AnimatePresence>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[10px] font-black text-rose-500 uppercase tracking-wider mt-4 ml-6"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-8 border-t border-slate-50 gap-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Estimated Total</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 break-all text-right leading-tight">
                  {estimatedTotal.toLocaleString()} <span className="text-lg sm:text-xl font-bold">{currency}</span>
                </span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                className={cn(
                  "w-full py-8 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-2xl",
                  orderTab === 'buy' ? "bg-emerald-500 text-white shadow-emerald-500/40" : "bg-rose-500 text-white shadow-rose-500/40"
                )}
              >
                PLACE {orderTab.toUpperCase()} ORDER
              </button>
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-slate-900/30">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 relative z-10">Available Balance</p>
            <div className="flex items-baseline gap-4 relative z-10">
              <span className="text-5xl font-black tracking-tighter italic">{cashKRW.toLocaleString()}</span>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">KRW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'quant' | 'trade' | 'assets' | 'notice' | 'requests' | 'history' | 'request-edit'>('quant');
  const [assetType, setAssetType] = useState<'domestic' | 'overseas' | 'cash'>('domestic');
  const [tradeType, setTradeType] = useState<'domestic' | 'overseas'>('domestic');
  const [quantType, setQuantType] = useState<'provided' | 'mine'>('provided');
  const [isAssetHovered, setIsAssetHovered] = useState(false);
  const [isTradeHovered, setIsTradeHovered] = useState(false);
  const [isQuantHovered, setIsQuantHovered] = useState(false);
  const [isServiceHovered, setIsServiceHovered] = useState(false);
  const [userRequests, setUserRequests] = useState<{ id: string; date: string; title: string; content: string; status: 'pending' | 'completed' }[]>([
    { id: '1', date: new Date().toISOString(), title: '환율 정보 개선 요청', content: '실시간 환율 정보가 더 정확했으면 좋겠습니다.', status: 'completed' },
    { id: '2', date: new Date().toISOString(), title: 'UI 개선안', content: '다크 모드 지원 부탁드려요.', status: 'pending' },
    { id: '3', date: new Date().toISOString(), title: '알림 설정 기능', content: '특정 가격 도달 시 푸시 알림을 받고 싶습니다.', status: 'pending' },
    { id: '4', date: new Date().toISOString(), title: '거래 리포트 다운로드', content: '월간 거래 내역을 PDF로 저장하고 싶습니다.', status: 'completed' },
    { id: '5', date: new Date().toISOString(), title: '기술적 지표 추가', content: 'Ichimoku Cloud 지표를 추가해 주세요.', status: 'pending' },
    { id: '6', date: new Date().toISOString(), title: '모바일 앱 최적화', content: '모바일에서 차트 로딩 속도가 느립니다.', status: 'pending' },
    { id: '7', date: new Date().toISOString(), title: '커뮤니티 기능', content: '다른 투자자들과 의견을 나눌 수 있는 게시판이 필요합니다.', status: 'pending' }
  ]);
  const [editingRequest, setEditingRequest] = useState<{ id: string; title: string; content: string; date: string; status: 'pending' | 'completed' } | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [chartData, setChartData] = useState<StockData[]>([]);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]);
  const [userScenarios, setUserScenarios] = useState<string[]>([]);
  const [reservations, setReservations] = useState<{ id: string; stockId: string; scenarioId: string; date: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);

  const [cashKRW, setCashKRW] = useState(125480000);
  const [cashUSD, setCashUSD] = useState(45210);
  const [domesticAssets, setDomesticAssets] = useState([
    { name: '삼성전자', code: '005930', q: 12, avgPrice: 68400, currPrice: 72100, profit: 5.4, currency: 'KRW' },
    { name: 'SK하이닉스', code: '000660', q: 8, avgPrice: 172000, currPrice: 184500, profit: 7.2, currency: 'KRW' },
    { name: '현대차', code: '005380', q: 5, avgPrice: 224000, currPrice: 218000, profit: -2.7, currency: 'KRW' },
  ]);
  const [overseasAssets, setOverseasAssets] = useState([
    { name: 'Apple', code: 'AAPL', q: 25, avgPrice: 175.2, currPrice: 189.4, profit: 8.1, currency: 'USD' },
    { name: 'Vanguard S&P 500 ETF', code: 'VOO', q: 10, avgPrice: 420.5, currPrice: 462.8, profit: 10.0, currency: 'USD' },
  ]);
  const [divKRW, setDivKRW] = useState(1250000);
  const [divUSD, setDivUSD] = useState(850);
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeType, setExchangeType] = useState<'cash' | 'dividend'>('cash');
  const [transactions, setTransactions] = useState<{ id: string; date: string; type: 'cash' | 'dividend'; fromAmount: number; fromCurrency: string; toAmount: number; toCurrency: string; action: 'EXCHANGE' | 'DEPOSIT'; memo?: string; }[]>([
    { id: 'init-1', date: new Date(Date.now() - 86400000).toISOString(), type: 'cash', fromAmount: 0, fromCurrency: '계좌이체', toAmount: 125480000, toCurrency: 'KRW', action: 'DEPOSIT' },
    { id: 'init-2', date: new Date(Date.now() - 172800000).toISOString(), type: 'cash', fromAmount: 0, fromCurrency: '외화계좌', toAmount: 45210, toCurrency: 'USD', action: 'DEPOSIT' },
    { id: 'div-1', date: new Date(Date.now() - 259200000).toISOString(), type: 'dividend', fromAmount: 0, fromCurrency: '삼성전자', toAmount: 450000, toCurrency: 'KRW', action: 'DEPOSIT' },
    { id: 'div-2', date: new Date(Date.now() - 345600000).toISOString(), type: 'dividend', fromAmount: 0, fromCurrency: 'Apple', toAmount: 120, toCurrency: 'USD', action: 'DEPOSIT' },
    { id: 'div-3', date: new Date(Date.now() - 432000000).toISOString(), type: 'dividend', fromAmount: 0, fromCurrency: 'SK하이닉스', toAmount: 800000, toCurrency: 'KRW', action: 'DEPOSIT' },
    { id: 'div-4', date: new Date(Date.now() - 518400000).toISOString(), type: 'dividend', fromAmount: 0, fromCurrency: 'Microsoft', toAmount: 730, toCurrency: 'USD', action: 'DEPOSIT' },
  ]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [historyType, setHistoryType] = useState<'cash' | 'dividend'>('cash');

  const handleAutoLogout = () => {
    setIsLoggedIn(false);
    setShowLogoutMessage(true);
  };

  useEffect(() => {
    setChartData(generateMockData(selectedStock.id));
  }, [selectedStock]);

  useEffect(() => {
    if (selectedStock.type !== tradeType) {
      const firstOfType = STOCKS.find(s => s.type === tradeType);
      if (firstOfType) {
        setSelectedStock(firstOfType);
      }
    }
  }, [tradeType, selectedStock.type]);

  const toggleScenario = (scenarioId: string) => {
    setAppliedScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId) 
        : [...prev, scenarioId]
    );
  };

  const filteredStocks = useMemo(() => 
    STOCKS.filter(s => 
      s.type === tradeType && (s.name.includes(searchQuery) || s.code.includes(searchQuery))
    ), [searchQuery, tradeType]);

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
                시나리오
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
                주식주문
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
                나의자산
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
                        setAssetType('cash');
                        setIsAssetHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        (activeTab === 'assets' && assetType === 'cash') ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      예수금
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
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

            <div 
              className="relative"
              onMouseEnter={() => setIsServiceHovered(true)}
              onMouseLeave={() => setIsServiceHovered(false)}
            >
              <button 
                onClick={() => setActiveTab('notice')}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap relative h-full",
                  activeTab === 'notice' ? "bg-white text-blue-600 shadow-xl shadow-slate-200" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                )}
              >
                <Info className="w-4 h-4" />
                고객서비스
                <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white" />
              </button>

              <AnimatePresence>
                {isServiceHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-[100] overflow-hidden"
                  >
                    <button 
                      onClick={() => {
                        setActiveTab('notice');
                        setIsServiceHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'notice' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      공지사항
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('requests');
                        setIsServiceHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'requests' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      요청사항
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
        {activeTab !== 'assets' && activeTab !== 'notice' && activeTab !== 'history' && activeTab !== 'requests' && activeTab !== 'request-edit' && (
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
          {activeTab !== 'assets' && activeTab !== 'notice' && activeTab !== 'history' && activeTab !== 'requests' && activeTab !== 'request-edit' && (
            <div className="flex items-center gap-4 mb-10">
              <div className="px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                <h1 className="text-lg font-black text-slate-900 tracking-tight">나의 시나리오</h1>
              </div>
            </div>
          )}

          {activeTab === 'assets' ? (
            <AssetView 
              type={assetType} 
              cashKRW={cashKRW}
              cashUSD={cashUSD}
              divKRW={divKRW}
              divUSD={divUSD}
              domesticAssets={domesticAssets}
              overseasAssets={overseasAssets}
              onOpenExchange={(type) => {
                setExchangeType(type);
                setIsExchangeModalOpen(true);
              }}
              onOpenHistory={(type) => {
                setHistoryType(type);
                setActiveTab('history');
              }}
            />
          ) : activeTab === 'history' ? (
            <HistoryView 
              transactions={transactions} 
              defaultType={historyType} 
              onBack={() => setActiveTab('assets')} 
            />
          ) : activeTab === 'requests' ? (
            <RequestsView 
              requests={userRequests} 
              onAdd={() => {
                setEditingRequest(null);
                setActiveTab('request-edit');
              }}
              onSelect={(request) => {
                setEditingRequest(request);
                setActiveTab('request-edit');
              }}
            />
          ) : activeTab === 'request-edit' ? (
            <RequestEditorView 
              request={editingRequest}
              onBack={() => {
                setEditingRequest(null);
                setActiveTab('requests');
              }}
              onSave={(title, content) => {
                if (editingRequest) {
                  setUserRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...r, title, content } : r));
                } else {
                  setUserRequests(prev => [{
                    id: Math.random().toString(36).substr(2, 9),
                    date: new Date().toISOString(),
                    title,
                    content,
                    status: 'pending'
                  }, ...prev]);
                }
                setActiveTab('requests');
              }}
              onDelete={(id) => {
                setUserRequests(prev => prev.filter(r => r.id !== id));
                setActiveTab('requests');
              }}
            />
          ) : activeTab === 'trade' ? (
            <TradeView 
              stock={selectedStock} 
              price={chartData[chartData.length - 1]?.price || 0} 
              type={tradeType} 
              balance={(selectedStock.code === 'AAPL' || selectedStock.code === 'VOO') ? cashUSD : cashKRW}
              ownedShares={([...domesticAssets, ...overseasAssets].find(a => a.code === selectedStock.code)?.q || 0)}
              cashKRW={cashKRW}
            />
          ) : activeTab === 'notice' ? (
            <NoticeView />
          ) : (
            <QuantDashboard 
              stock={selectedStock}
              chartData={chartData}
              appliedScenarios={appliedScenarios}
              toggleScenario={toggleScenario}
              signals={signals}
              quantType={quantType}
              userScenarios={userScenarios}
              addUserScenario={(id) => setUserScenarios(prev => prev.includes(id) ? prev : [...prev, id])}
              removeUserScenario={(id) => setUserScenarios(prev => prev.filter(sId => sId !== id))}
              onReserve={(scenarioId) => {
                const newRes = {
                  id: Math.random().toString(36).substr(2, 9),
                  stockId: selectedStock.id,
                  scenarioId,
                  date: new Date().toISOString()
                };
                setReservations(prev => [newRes, ...prev]);
                alert(`${selectedStock.name} - ${SCENARIOS.find(s => s.id === scenarioId)?.name} 예약되었습니다.`);
              }}
              reservationsCount={reservations.length}
              onShowHistory={() => {
                setIsReservationModalOpen(true);
              }}
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
        {isExchangeModalOpen && (
          <ExchangeModal 
            onClose={() => setIsExchangeModalOpen(false)}
            type={exchangeType}
            cashKRW={exchangeType === 'cash' ? cashKRW : divKRW}
            cashUSD={exchangeType === 'cash' ? cashUSD : divUSD}
            onExchange={(amount, direction) => {
              const RATE = 1350;
              const toAmount = direction === 'KtoU' ? amount / RATE : amount * RATE;
              const fromCurr = direction === 'KtoU' ? 'KRW' : 'USD';
              const toCurr = direction === 'KtoU' ? 'USD' : 'KRW';

              const newTransaction = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString(),
                type: exchangeType,
                fromAmount: amount,
                fromCurrency: fromCurr,
                toAmount: toAmount,
                toCurrency: toCurr,
                action: 'EXCHANGE' as const
              };

              setTransactions(prev => [newTransaction, ...prev]);

              if (exchangeType === 'cash') {
                if (direction === 'KtoU') {
                  setCashKRW(prev => prev - amount);
                  setCashUSD(prev => prev + toAmount);
                } else {
                  setCashUSD(prev => prev - amount);
                  setCashKRW(prev => prev + toAmount);
                }
              } else {
                if (direction === 'KtoU') {
                  setDivKRW(prev => prev - amount);
                  setDivUSD(prev => prev + toAmount);
                } else {
                  setDivUSD(prev => prev - amount);
                  setDivKRW(prev => prev + toAmount);
                }
              }
              setIsExchangeModalOpen(false);
            }}
          />
        )}
        {isReservationModalOpen && (
          <ReservationHistoryModal 
            onClose={() => setIsReservationModalOpen(false)}
            reservations={reservations}
            onCancel={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
          />
        )}
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
  signals,
  quantType,
  userScenarios,
  addUserScenario,
  removeUserScenario,
  onReserve,
  reservationsCount,
  onShowHistory
}: { 
  stock: Stock; 
  chartData: StockData[]; 
  appliedScenarios: string[]; 
  toggleScenario: (id: string) => void;
  signals: any[];
  quantType: 'provided' | 'mine';
  userScenarios: string[];
  addUserScenario: (id: string) => void;
  removeUserScenario: (id: string) => void;
  onReserve: (id: string) => void;
  reservationsCount: number;
  onShowHistory: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const displayScenarios = useMemo(() => {
    let list = quantType === 'provided' ? [...SCENARIOS] : SCENARIOS.filter(s => userScenarios.includes(s.id));
    
    // Search
    if (searchQuery.trim()) {
      list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return b.popularity - a.popularity;
    });

    return list;
  }, [quantType, userScenarios, searchQuery, sortBy]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stock Info Bar */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 ml-1 mb-2">
            <div className="px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-black text-slate-900">{stock.name}</span>
              <div className="w-px h-3 bg-slate-200" />
              <span className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">
                {stock.code === 'AAPL' || stock.code === 'VOO' ? 'GLOBAL' : 'KOSPI'} {stock.code}
              </span>
            </div>
          </div>
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

        <div className="flex items-center gap-4">
          {/* Yellow Reserve Button - Only visible in 'mine' tab */}
          {quantType === 'mine' && appliedScenarios.length > 0 && (
            <button 
              onClick={() => {
                appliedScenarios.forEach(id => onReserve(id));
              }}
              className="px-8 py-4 bg-yellow-400 text-slate-900 rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-xl shadow-yellow-200 hover:-translate-y-1 transition-all active:scale-95 border-b-4 border-yellow-600"
            >
              예약
            </button>
          )}

          {/* Yellow Location for Reservation History - Only visible in 'mine' tab */}
          {quantType === 'mine' && (
            <button 
              onClick={onShowHistory}
              className="flex items-center gap-2.5 px-6 py-4 bg-yellow-400 text-slate-900 rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-xl shadow-yellow-200 hover:-translate-y-1 transition-all active:scale-95"
            >
              <Clock className="w-4 h-4" />
              예약내역
              <span className="bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] ml-1">{reservationsCount}</span>
            </button>
          )}

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
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Side Selection Area (Analysis Tools integrated) */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-2xl shadow-slate-100/50 h-full flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
              {quantType === 'provided' ? 'Analysis Tools' : 'My Tools'}
            </h3>
            
            {/* Search and Sort */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                />
              </div>
              <button 
                onClick={() => setSortBy(prev => prev === 'latest' ? 'popular' : 'latest')}
                className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort: {sortBy === 'latest' ? '최신순' : '인기순'}</span>
                </div>
              </button>
            </div>
            
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar max-h-[440px] pr-2 flex-1 pt-4">
              {displayScenarios.length > 0 ? (
                displayScenarios.map(s => {
                  const isNew = (new Date().getTime() - new Date(s.createdAt).getTime()) < (5 * 24 * 60 * 60 * 1000);
                  return (
                    <div key={s.id} className="relative group/card">
                      <div className="flex gap-2 mb-2">
                         <button 
                          onClick={() => toggleScenario(s.id)}
                          className={cn(
                            "flex-1 text-left p-5 rounded-3xl transition-all border group relative",
                            appliedScenarios.includes(s.id) 
                              ? "bg-slate-900 border-slate-900 shadow-xl shadow-slate-200" 
                              : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                          )}
                        >
                          {isNew && (
                            <div className="absolute top-0 left-6 -translate-y-1/2 z-30 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg animate-bounce shadow-lg shadow-emerald-200/50 whitespace-nowrap">
                              NEW
                            </div>
                          )}
                          <div className="flex items-center gap-4 mb-3">
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
                        
                        <div className="flex flex-col gap-2">
                          {quantType === 'provided' && !userScenarios.includes(s.id) ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addUserScenario(s.id);
                              }}
                              className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-110 transition-all z-20"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : quantType === 'mine' ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUserScenario(s.id);
                              }}
                              className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-rose-700 hover:scale-110 transition-all z-20"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">나의 자료가 없습니다</p>
                </div>
              )}
              {quantType === 'mine' && (
                <button className="w-full p-6 border-4 border-dashed border-slate-50 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-blue-400 hover:border-blue-100 hover:bg-blue-50/10 transition-all group">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Strategy</span>
                </button>
              )}
            </div>
          </div>
        </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExchangeModal = ({ 
  onClose, 
  cashKRW, 
  cashUSD, 
  onExchange,
  type
}: { 
  onClose: () => void, 
  cashKRW: number, 
  cashUSD: number, 
  onExchange: (amount: number, direction: 'KtoU' | 'UtoK') => void,
  type: 'cash' | 'dividend'
}) => {
  const [direction, setDirection] = useState<'KtoU' | 'UtoK'>('KtoU');
  const [amount, setAmount] = useState('');
  const RATE = 1350;

  const handleExchange = () => {
    const val = Number(amount);
    if (!val || val <= 0) return;
    if (direction === 'KtoU' && val > cashKRW) {
      alert('잔액이 부족합니다.');
      return;
    }
    if (direction === 'UtoK' && val > cashUSD) {
      alert('잔액이 부족합니다.');
      return;
    }
    onExchange(val, direction);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {type === 'cash' ? 'Cash Exchange' : 'Dividend Exchange'}
          </h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">From</label>
            <div className="relative">
              <select 
                value={direction === 'KtoU' ? 'KRW' : 'USD'}
                onChange={(e) => {
                  setDirection(e.target.value === 'KRW' ? 'KtoU' : 'UtoK');
                  setAmount('');
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="KRW">KRW (₩)</option>
                <option value="USD">USD ($)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">To</label>
            <div className="relative">
              <select 
                value={direction === 'KtoU' ? 'USD' : 'KRW'}
                onChange={(e) => {
                  setDirection(e.target.value === 'USD' ? 'KtoU' : 'UtoK');
                  setAmount('');
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="KRW">KRW (₩)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">From Balance</label>
            <p className="text-xl font-black text-slate-800">
              {direction === 'KtoU' ? `${cashKRW.toLocaleString()} KRW` : `${cashUSD.toLocaleString()} USD`}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Exchange Amount</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-2xl font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                {direction === 'KtoU' ? 'KRW' : 'USD'}
              </span>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated To Receive</span>
              <span className="text-xl font-black text-blue-600">
                {direction === 'KtoU' 
                  ? ((Number(amount) || 0) / RATE).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : ((Number(amount) || 0) * RATE).toLocaleString()
                } {direction === 'KtoU' ? 'USD' : 'KRW'}
              </span>
            </div>
            <p className="text-[9px] font-bold text-slate-300 italic uppercase">Exchange Rate: 1 USD = {RATE} KRW</p>
          </div>
        </div>

        <button 
          onClick={handleExchange}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-xs font-black tracking-[0.2em] uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95"
        >
          Confirm Exchange
        </button>
      </motion.div>
    </div>
  );
};

const ReservationHistoryModal = ({ 
  onClose, 
  reservations,
  onCancel
}: { 
  onClose: () => void, 
  reservations: any[],
  onCancel: (id: string) => void
}) => {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">예약 내역</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Scheduled Strategies & Scenarios</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 -mr-4">
          {reservations.length > 0 ? (
            <div className="space-y-4">
              {reservations.map(res => {
                const stock = STOCKS.find(s => s.id === res.stockId);
                const scenario = SCENARIOS.find(s => s.id === res.scenarioId);
                return (
                  <div key={res.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${scenario?.color}10`, color: scenario?.color }}>
                        {scenario?.icon}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <h4 className="text-base font-black text-slate-900">{stock?.name}</h4>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{stock?.code}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500">{scenario?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{format(new Date(res.date), 'yyyy.MM.dd HH:mm')}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onCancel(res.id)}
                      className="px-6 py-3 bg-white border border-slate-200 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-all"
                    >
                      취소
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">예약된 내역이 없습니다</p>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-xs font-black tracking-[0.2em] uppercase shadow-2xl hover:bg-blue-600 transition-all mt-8"
        >
          돌아가기
        </button>
      </motion.div>
    </div>
  );
};

const HistoryView = ({ 
  transactions,
  defaultType,
  onBack
}: { 
  transactions: any[],
  defaultType: 'cash' | 'dividend',
  onBack: () => void
}) => {
  const [type, setType] = useState<'cash' | 'dividend'>(defaultType);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = transactions.filter(t => {
    const isTypeMatch = t.type === type;
    const tDate = new Date(t.date).toISOString().split('T')[0];
    const isAfterStart = startDate ? tDate >= startDate : true;
    const isBeforeEnd = endDate ? tDate <= endDate : true;
    return isTypeMatch && isAfterStart && isBeforeEnd;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
              {type === 'cash' ? '예수금 이용내역' : '배당금 이용내역'}
            </h2>
            <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Transaction & Dividend History</p>
          </div>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setType('cash')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              type === 'cash' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400"
            )}
          >
            예수금
          </button>
          <button 
            onClick={() => setType('dividend')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              type === 'dividend' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400"
            )}
          >
            배당금
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/20 flex flex-wrap items-end gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 appearance-none cursor-pointer"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">End Date</label>
          <input 
            type="date" 
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-xs font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 appearance-none cursor-pointer"
          />
        </div>
        <button 
          onClick={() => { setStartDate(''); setEndDate(''); }}
          className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          Reset Filter
        </button>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map(t => (
            <div key={t.id} className="p-8 bg-white border border-slate-200 rounded-[3rem] shadow-sm hover:shadow-xl transition-all">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {new Date(t.date).toLocaleString()}
                </span>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  SUCCESS
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
                    {t.action === 'DEPOSIT' ? (t.type === 'dividend' ? '주식명' : '입금처') : 'From'}
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {t.action === 'DEPOSIT' ? t.fromCurrency : `${t.fromAmount.toLocaleString()} ${t.fromCurrency}`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-slate-200" />
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
                    {t.action === 'DEPOSIT' ? (t.type === 'dividend' ? '주식명' : 'Account') : 'To'}
                  </p>
                  <p className={cn("text-xl font-black", t.action === 'DEPOSIT' ? "text-emerald-500" : "text-blue-600")}>
                    {t.toAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-xs uppercase tracking-tighter">{t.toCurrency}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-40 text-center bg-white border border-slate-200 rounded-[3rem] border-dashed">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RequestsView = ({ 
  requests,
  onAdd,
  onSelect
}: { 
  requests: any[],
  onAdd: () => void,
  onSelect: (request: any) => void
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const itemsPerPage = 5;
  
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const titleLower = r.title.toLowerCase();
      const contentLower = r.content.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = titleLower.includes(queryLower) || contentLower.includes(queryLower);
      
      const rDate = new Date(r.date);
      // Reset hours for date-only comparison
      rDate.setHours(0, 0, 0, 0);
      
      const matchesStart = startDate === '' || rDate >= new Date(startDate);
      const matchesEnd = endDate === '' || rDate <= new Date(endDate);
      
      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [requests, searchQuery, startDate, endDate]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">서비스 요청사항</h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Your Feedback & Feature Requests</p>
      </div>

      {/* Search and Date Filter */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="요청사항 제목이나 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 px-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
            <span className="text-slate-300 font-black">~</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
          </div>
          {(searchQuery || startDate || endDate) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {currentRequests.length > 0 ? (
          currentRequests.map((r) => (
            <button 
              key={r.id}
              onClick={() => onSelect(r)}
              className="w-full text-left bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {new Date(r.date).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                    r.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {r.status === 'completed' ? 'Reflected' : 'Pending'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2 truncate">{r.title}</h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed truncate">{r.content}</p>
            </button>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold tracking-tight">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn(
                "w-12 h-12 rounded-2xl text-[10px] font-black transition-all",
                currentPage === page 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white border border-slate-200 text-slate-400 hover:border-slate-300"
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-10">
        <button 
          onClick={onAdd}
          className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          신규 요청 작성
        </button>
      </div>
    </div>
  );
};

const RequestEditorView = ({ 
  request,
  onBack,
  onSave,
  onDelete
}: { 
  request: any | null,
  onBack: () => void,
  onSave: (title: string, content: string) => void,
  onDelete: (id: string) => void
}) => {
  const [title, setTitle] = useState(request?.title || '');
  const [content, setContent] = useState(request?.content || '');

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
            {request ? '요청사항 상세' : '신규 요청 작성'}
          </h2>
        </div>

        {request && (
          <button 
            onClick={() => onDelete(request.id)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
          >
            <Plus className="w-4 h-4 rotate-45" />
            Delete
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/20 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">제목</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="요청 제목을 입력하세요"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">내용</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상세 내용을 입력하세요..."
            className="w-full h-64 bg-slate-50 border border-slate-100 rounded-2xl py-6 px-8 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="pt-6">
          <button 
            onClick={() => {
              if (title.trim() && content.trim()) onSave(title, content);
            }}
            className="w-full py-6 bg-slate-900 text-white rounded-3xl text-sm font-black tracking-widest uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95"
          >
            {request ? '수정사항 저장' : '요청하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AssetView = ({ 
  type,
  cashKRW,
  cashUSD,
  divKRW,
  divUSD,
  domesticAssets,
  overseasAssets,
  onOpenExchange,
  onOpenHistory
}: { 
  type: 'domestic' | 'overseas' | 'cash',
  cashKRW: number,
  cashUSD: number,
  divKRW: number,
  divUSD: number,
  domesticAssets: any[],
  overseasAssets: any[],
  onOpenExchange: (type: 'cash' | 'dividend') => void,
  onOpenHistory: (type: 'cash' | 'dividend') => void
}) => {
  const assets = type === 'domestic' ? domesticAssets : type === 'overseas' ? overseasAssets : [];

  const currency = type === 'domestic' ? 'KRW' : 'USD';
  const totalValue = assets.reduce((acc, curr) => acc + (curr.currPrice * curr.q), 0);
  const totalProfit = assets.reduce((acc, curr) => acc + ((curr.currPrice - curr.avgPrice) * curr.q), 0);

  if (type === 'cash') {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">예수금</h3>
            </div>
            <div className="space-y-6 mb-8">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{cashUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-widest italic font-mono">USD</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Overseas Cash</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-3xl font-black text-slate-700 tracking-tighter">{cashKRW.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-widest italic font-mono">KRW</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Domestic Cash</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onOpenExchange('cash')} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all">Exchange</button>
              <button onClick={() => onOpenHistory('cash')} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all">History</button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">배당금</h3>
            </div>
            <div className="space-y-6 mb-8">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{divUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-widest italic font-mono">USD</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Overseas Dividends</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-3xl font-black text-slate-700 tracking-tighter">{divKRW.toLocaleString()} <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase tracking-widest italic font-mono">KRW</span></p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Domestic Dividends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onOpenExchange('dividend')} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-blue-600 transition-all">Exchange</button>
              <button onClick={() => onOpenHistory('dividend')} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black tracking-widest uppercase hover:bg-slate-200 transition-all">History</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Total Portfolio Value</h3>
          <p className="text-4xl font-black text-white tracking-tighter mb-4">{totalValue.toLocaleString()} <span className="text-sm font-bold text-slate-500 ml-1.5 uppercase tracking-widest italic font-mono">{currency}</span></p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              {totalValue > 0 ? `+${(totalProfit / totalValue * 100).toFixed(2)}%` : '0.00%'} (+{totalProfit.toLocaleString()})
            </span>
            <span className="text-[9px] font-bold text-slate-600 italic">Across {assets.length} Positions</span>
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
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const notices = [
    {
      id: 1,
      title: "서비스 서버 점검 안내 (05/01 02:00~06:00)",
      content: "더욱 안정적인 퀀트 분석 서비스를 제공하기 위해 서버 점검을 진행합니다. 해당 시간에는 서비스 이용이 일시 중단되오니 양해 부탁드립니다. 이번 점검은 데이터 정합성 강화와 보안 패치 적용을 포함하고 있습니다. 이용에 불편을 드려 대단히 죄송하며, 더욱 안정적인 서비스를 제공할 것을 약속드립니다.",
      date: "2024.04.24",
      category: "점검",
      isNew: true
    },
    {
      id: 2,
      title: "해외 주식 실시간 시세 제공 서비스 오픈",
      content: "미국 시장(NYSE, NASDAQ) 실시간 시세 제공 서비스가 정식 출시되었습니다. 이제 전 세계 주요 지수를 실시간 분석해 보세요. 그동안 지연 시세로 인한 분석의 어려움을 해소하고자 실시간 데이터 파이프라인을 구축하였습니다. 모든 서비스 이용자에게 기본적으로 제공되며, 향후 다양한 글로벌 지수로 확대할 예정입니다.",
      date: "2024.04.22",
      category: "업데이트",
      isNew: false
    },
    {
      id: 3,
      title: "개인정보 처리방침 개정 안내",
      content: "개정된 법령에 따라 당사의 개인정보 처리방침이 변경되었습니다. 자세한 내용은 전문을 확인해 주시기 바랍니다. 주요 변경 사항은 수집하는 개인정보 항목의 명확화와 제3자 제공 동의 절차의 간소화입니다. 변경된 방침은 공고일로부터 7일 뒤에 발효됩니다. ",
      date: "2024.04.15",
      category: "공지",
      isNew: false
    }
  ];

  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      const titleLower = notice.title.toLowerCase();
      const contentLower = notice.content.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = titleLower.includes(queryLower) || contentLower.includes(queryLower);
      
      const noticeDate = new Date(notice.date.replace(/\./g, '-'));
      noticeDate.setHours(0, 0, 0, 0);

      const matchesStart = startDate === '' || noticeDate >= new Date(startDate);
      const matchesEnd = endDate === '' || noticeDate <= new Date(endDate);
      
      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [searchQuery, startDate, endDate]);

  if (selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedNotice(null)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">서비스 공지사항</h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">QuantLab Service Notices & Updates</p>
      </div>

      {/* Search and Date Filter */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="공지사항 제목이나 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 px-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
            <span className="text-slate-300 font-black">~</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
          </div>
          {(searchQuery || startDate || endDate) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <motion.div 
              key={notice.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedNotice(notice)}
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
              <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                {notice.content}
              </p>
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                  자세히 보기
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold tracking-tight">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-slate-300 hover:bg-blue-600 transition-all">
          더 많은 공지사항 보기
        </button>
      </div>
    </div>
  );
};
