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
  ChevronLeft,
  Info,
  RefreshCw,
  Sparkles,
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
  Filter,
  Trash2,
  Save,
  Pencil,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Trophy
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

// --- Translations ---

const translations = {
  ko: {
    login: '로그인',
    logout: '로그아웃',
    providedScenarios: '제공 시나리오',
    myScenarios: '나의 시나리오',
    trade: '주식주문',
    domestic: '국내주식',
    overseas: '해외주식',
    myAssets: '나의자산',
    depositDiv: '예수금/배당금',
    dividend: '배당금',
    cash: '예수금',
    service: '고객서비스',
    quiz: '퀴즈',
    requests: '요청사항',
    notice: '공지사항',
    testResults: '테스트결과',
    search: '검색...',
    searchStocks: '종목 검색...',
    backtestScore: '백테스트 점수',
    winRate: '선방률',
    alphaRatio: '알파 비율',
    signalLoad: '신호 포착',
    recommendedStocks: '추천 종목',
    selectScenario: '시나리오 선택',
    purchasable: '매수 가능',
    holdings: '보유 수량',
    quantity: '주문 수량',
    orderPrice: '주문 가격',
    estimatedTotal: '전체 예상 금액',
    totalPortfolio: '총 포트폴리오 가치',
    activePositions: '보유 종목',
    exchange: '환전',
    history: '내역',
    deposit: '입금',
    addStrategy: '전략 추가',
    save: '저장',
    edit: '수정',
    delete: '삭제',
    apply: '적용',
    reserve: '예약',
    reservationHistory: '예약 내역',
    back: '돌아가기',
    confirm: '확인',
    question: '문제',
    explanation: '해설',
    next: '다음',
    viewResult: '결과 보기',
    reset: '다시 풀기',
    inputRequest: '신규 요청 작성',
    depositScreen: '입금하기',
    selectAmount: '금액 선택',
    currentCash: '현재 예수금',
    providedData: '제공자료',
    myData: '나의자료',
    searchTitle: '포착된 주요 종목 분석',
    noItems: '포착된 종목이 없습니다.',
    learningComplete: '학습 완료!',
    resultText: (score: number, total: number) => `${total}개의 퀴즈 중 ${score}개를 맞췄습니다.`,
    domesticOrder: '국내주식',
    overseasOrder: '해외주식',
    orderHistory: '주문내역',
    marketPrice: '현재가',
    availableBalance: '주문 가능 금액'
  },
  en: {
    login: 'Log In',
    logout: 'Logout',
    providedScenarios: 'Provided Scenarios',
    myScenarios: 'My Scenarios',
    trade: 'Trade',
    domestic: 'Domestic',
    overseas: 'Overseas',
    myAssets: 'My Assets',
    depositDiv: 'Deposit/Div.',
    dividend: 'Dividend',
    cash: 'Deposit',
    service: 'Service',
    quiz: 'Quiz',
    requests: 'Requests',
    notice: 'Notice',
    testResults: 'Test Result',
    search: 'Search...',
    searchStocks: 'Search Stocks...',
    backtestScore: 'Backtest Score',
    winRate: 'WIN RATE',
    alphaRatio: 'Alpha Ratio',
    signalLoad: 'Signal Load',
    recommendedStocks: 'Recommended Stocks',
    selectScenario: 'Select Scenario',
    purchasable: 'Purchasable',
    holdings: 'Holdings',
    quantity: 'Quantity',
    orderPrice: 'Order Price',
    estimatedTotal: 'Estimated Total',
    totalPortfolio: 'Total Portfolio Value',
    activePositions: 'Active Positions',
    exchange: 'Exchange',
    history: 'History',
    deposit: 'Deposit',
    addStrategy: 'Add Strategy',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    apply: 'Apply',
    reserve: 'Reserve',
    reservationHistory: 'Reservations',
    back: 'Back',
    confirm: 'Confirm',
    question: 'Question',
    explanation: 'Explanation',
    next: 'Next',
    viewResult: 'Result',
    reset: 'Reset',
    inputRequest: 'New Request',
    depositScreen: 'Deposit Cash',
    selectAmount: 'Select Amount',
    currentCash: 'Current Balance',
    providedData: 'Provided Data',
    myData: 'My Data',
    searchTitle: 'Captured Item Analysis',
    noItems: 'No items captured.',
    learningComplete: 'Learning Complete!',
    resultText: (score: number, total: number) => `You got ${score} out of ${total} correctly.`,
    domesticOrder: 'Domestic Stocks',
    overseasOrder: 'Overseas Stocks',
    orderHistory: 'Order History',
    marketPrice: 'Market Price',
    availableBalance: 'Available Balance'
  }
};

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
  enName: string;
  description: string;
  enDescription: string;
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

interface Quiz {
  id: number;
  question: string;
  enQuestion: string;
  options: string[];
  enOptions: string[];
  correctAnswer: number;
  explanation: string;
  enExplanation: string;
}

const QUIZZES: Quiz[] = [
  {
    id: 1,
    question: "주식 시장에서 'EV/EBITDA'는 무엇을 측정하는 지표인가요?",
    enQuestion: "What does 'EV/EBITDA' measure in the stock market?",
    options: [
      "회사의 부채비율",
      "기업의 가치가 영업이익의 몇 배인지를 나타내는 지표",
      "주식 한 주당 순익",
      "회사의 배당 성향"
    ],
    enOptions: [
      "Company debt ratio",
      "Indicator of how many times enterprise value is to operating profit",
      "Earnings per share",
      "Dividend payout ratio"
    ],
    correctAnswer: 1,
    explanation: "EV/EBITDA는 기업의 가치(Enterprise Value)를 세금 및 이자 지급 전 이익(EBITDA)으로 나눈 값으로, 기업이 영업활동을 통해 얻은 이익으로 기업가치만큼을 벌어들이는 데 몇 년이 걸리는지를 보여줍니다.",
    enExplanation: "EV/EBITDA is calculated by dividing Enterprise Value by EBITDA. It shows how many years it takes to earn the company's value through operating profits."
  },
  {
    id: 2,
    question: "조엘 그린블라트의 '마법의 공식'에서 가장 중요하게 생각하는 두 가지 지표는?",
    enQuestion: "What are the two most important indicators in Joel Greenblatt's 'Magic Formula'?",
    options: [
      "PBR과 PER",
      "자본이익률(ROC)과 이익수익률",
      "매출액 증가율과 영업이익률",
      "부채비율과 유보율"
    ],
    enOptions: [
      "PBR and PER",
      "Return on Capital (ROC) and Earnings Yield",
      "Revenue growth and Operating margin",
      "Debt ratio and Reserve ratio"
    ],
    correctAnswer: 1,
    explanation: "마법의 공식은 우량주(높은 자본이익률)를 싼 가격(높은 이익수익률)에 매수하는 전략입니다.",
    enExplanation: "The Magic Formula is a strategy to buy quality stocks (high ROC) at cheap prices (high earnings yield)."
  },
  {
    id: 3,
    question: "주식 차트에서 '골든크로스'란 무엇을 의미하나요?",
    enQuestion: "What does 'Golden Cross' mean in a stock chart?",
    options: [
      "단기 이동평균선이 장기 이동평균선을 아래에서 위로 뚫고 올라가는 것",
      "주가가 급락하는 신호",
      "거래량이 급격히 줄어드는 현상",
      "장기 이동평균선이 단기 이동평균선을 위에서 아래로 뚫고 내려가는 것"
    ],
    enOptions: [
      "Short-term moving average crossing above the long-term moving average",
      "Signal of sharp price drop",
      "Phenomenon of rapidly decreasing volume",
      "Long-term moving average crossing above the short-term moving average"
    ],
    correctAnswer: 0,
    explanation: "골든크로스는 강세장으로의 전환을 시사하는 전형적인 매수 신호입니다.",
    enExplanation: "A Golden Cross is a typical buy signal indicating a transition to a bull market."
  }
];

const MAGIC_FORMULA_DATA = [
  { roc: '42% (A++)', evEbitda: '7.2배 (A)', score: '9.5 / 10', timing: '[골든크로스 대기]', color: 'text-emerald-600' },
  { roc: '35% (A)', evEbitda: '9.1배 (A-)', score: '9.0 / 10', timing: '[관망]', color: 'text-slate-500' },
  { roc: '18% (B)', evEbitda: '25.4배 (C)', score: '7.2 / 10', timing: '[분할 매도 권장]', color: 'text-amber-500' },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'ma-cross',
    name: '이동평균선 골든크로스',
    enName: 'MA Golden Cross',
    description: '단기 이평선(5일)이 장기 이평선(20일)을 상향 돌파할 때 매수 신호',
    enDescription: 'Buy signal when the 5-day MA crosses above the 20-day MA',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#3B82F6',
    createdAt: '2026-04-23',
    popularity: 95
  },
  {
    id: 'rsi-oversold',
    name: 'RSI 과매도 반등',
    enName: 'RSI Oversold Bounce',
    description: 'RSI 지표가 30 이하로 내려갔다가 다시 상승할 때 기술적 반등 포착',
    enDescription: 'Captures technical bounce when RSI falls below 30 and recovers',
    icon: <Activity className="w-4 h-4" />,
    color: '#10B981',
    createdAt: '2026-04-21',
    popularity: 88
  },
  {
    id: 'volume-spike',
    name: '거래량 폭발',
    enName: 'Volume Spike',
    description: '평균 거래량 대비 200% 이상 기록 시 추세 전환 가능성 확인',
    enDescription: 'Trend reversal possibility when volume exceeds 200% of average',
    icon: <Zap className="w-4 h-4" />,
    color: '#F59E0B',
    createdAt: '2026-03-10',
    popularity: 76
  },
  {
    id: 'bollinger',
    name: '볼린저 밴드 하단',
    enName: 'Bollinger Band Bottom',
    description: '주가가 볼린저 밴드 하단에 도달하여 지지선을 형성하는 구간',
    enDescription: 'Price reaching the lower Bollinger Band forming a support level',
    icon: <Layers className="w-4 h-4" />,
    color: '#8B5CF6',
    createdAt: '2026-04-05',
    popularity: 92
  },
  {
    id: 'magic-formula',
    name: '마법의 공식 (Magic Formula)',
    enName: 'Magic Formula',
    description: '우량주(높은 ROC)를 싼 가격(낮은 EV/EBIT)에 매수하는 조엘 그린블라트의 전략',
    enDescription: "Joel Greenblatt's strategy: buy quality stocks at cheap prices",
    icon: <Sparkles className="w-4 h-4" />,
    color: '#EC4899',
    createdAt: '2026-04-25',
    popularity: 99
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
  cashKRW,
  t
}: { 
  stock: Stock; 
  price: number; 
  type: 'domestic' | 'overseas';
  balance: number;
  ownedShares: number;
  cashKRW: number;
  t: any
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
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.searchStocks}</span>
            </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stock.code} | {stock.type === 'overseas' ? 'GLOBAL' : 'KOSPI'}</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {stock.name}
            </h2>
          </div>
          <div className="h-10 w-px bg-slate-100 mx-4" />
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
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{t.marketPrice}</p>
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
                {t.apply.toUpperCase()} (BUY)
              </button>
              <button 
                onClick={() => setOrderTab('sell')}
                className={cn(
                  "flex-1 py-4 text-[12px] font-black uppercase tracking-widest rounded-[1.25rem] transition-all",
                  orderTab === 'sell' ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {t.delete.toUpperCase()} (SELL)
              </button>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {orderTab === 'buy' ? t.purchasable : t.holdings}
                </span>
                <span className="text-xs font-black text-slate-700">
                  {orderTab === 'buy' ? `${balance.toLocaleString()} ${currency}` : `${ownedShares}주`}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.orderPrice} ({currency})</p>
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
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t.quantity}</p>
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
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest shrink-0">{t.estimatedTotal}</span>
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
                {orderTab === 'buy' ? t.apply : t.delete} {t.confirm}
              </button>
            </div>
          </div>

          {/* Available Balance Card */}
          <div className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative shadow-2xl shadow-slate-900/30">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full -mr-32 -mt-32" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 relative z-10">{t.availableBalance}</p>
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

// --- Strategy Edit View ---

const StrategyEdit = ({ onBack, onSave }: { onBack: () => void; onSave: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">ADD NEW STRATEGY</h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-100/50">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Strategy Name</label>
            <input 
              type="text" 
              placeholder="전략명을 입력하세요..."
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-xl font-black text-slate-900 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-200"
            />
          </div>

          <div className="space-y-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Description</label>
            <textarea 
              rows={4}
              placeholder="전략에 대한 설명을 입력하세요..."
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-lg font-bold text-slate-700 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-200 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Target Market</label>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-sm font-black text-slate-800 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none">
                <option>Domestic (KOSPI/KOSDAQ)</option>
                <option>Global (US/NASDAQ)</option>
              </select>
            </div>
            <div className="space-y-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Risk Tolerance</label>
              <select className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-sm font-black text-slate-800 focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all appearance-none">
                <option>Conservative</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex items-center justify-between gap-6 pt-10 border-t border-slate-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 px-10 py-6 bg-slate-100 text-slate-400 rounded-[2rem] text-xs font-black tracking-widest uppercase hover:bg-rose-50 hover:text-rose-500 transition-all group"
        >
          <Trash2 className="w-4 h-4" />
          삭제
        </button>
        <div className="flex items-center gap-6">
          <button 
            className="flex items-center gap-3 px-10 py-6 bg-white border border-slate-200 text-slate-900 rounded-[2rem] text-xs font-black tracking-widest uppercase hover:bg-slate-50 transition-all shadow-sm"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
            수정
          </button>
          <button 
            onClick={onSave}
            className="flex items-center gap-3 px-12 py-6 bg-blue-600 text-white rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-2xl shadow-blue-600/30 hover:-translate-y-1 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            저장
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Test Results View ---

const TestResultsView = ({ 
  scenarios, 
  onSelectScenario, 
  selectedScenarioId, 
  stocks,
  t 
}: { 
  scenarios: Scenario[]; 
  onSelectScenario: (id: string) => void; 
  selectedScenarioId: string; 
  stocks: { name: string; symbol: string; change: string; reason: string }[];
  t: any
}) => {
  return (
    <div className="grid grid-cols-12 gap-8 animate-in fade-in duration-700">
      {/* Sidebar: Scenarios */}
      <div className="col-span-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-2xl shadow-slate-100/50">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">{t.selectScenario}</h3>
          <div className="space-y-4">
            {scenarios.map(s => (
              <button 
                key={s.id}
                onClick={() => onSelectScenario(s.id)}
                className={cn(
                  "w-full text-left p-6 rounded-3xl transition-all border group",
                  selectedScenarioId === s.id 
                    ? "bg-slate-900 border-slate-900 shadow-xl" 
                    : "bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                    selectedScenarioId === s.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                  )}>
                    {s.icon}
                  </div>
                  <div>
                    <h4 className={cn(
                      "text-sm font-black tracking-tight",
                      selectedScenarioId === s.id ? "text-white" : "text-slate-900"
                    )}>{s.name}</h4>
                    <p className={cn(
                      "text-[10px] font-bold mt-1",
                      selectedScenarioId === s.id ? "text-slate-400" : "text-slate-500"
                    )}>Updated: {s.createdAt}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main: Recommended Stocks */}
      <div className="col-span-8 space-y-8">
        <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-100/50">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{t.recommendedStocks}</h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.searchTitle}</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Live Analysis
            </div>
          </div>

          <div className="space-y-6">
            {stocks.length > 0 ? (
              stocks.map((stock, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-lg font-black text-slate-900 shadow-sm">
                        {stock.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">{stock.name}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{stock.symbol}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-2xl font-black tracking-tighter",
                        stock.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"
                      )}>{stock.change}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Expected Vol.</p>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-slate-200/50">
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded bg-blue-50 text-blue-500 flex items-center justify-center mt-0.5">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-600 leading-relaxed font-black">{stock.reason}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.noItems}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const QuizView = ({ t, lang }: { t: any, lang: 'ko' | 'en' }) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuiz = QUIZZES[currentQuizIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuiz.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuizIndex < QUIZZES.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white border border-slate-100 rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-500/10"
      >
        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Trophy className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{t.learningComplete}</h2>
        <p className="text-slate-500 font-bold mb-8">
          {t.resultText(score, QUIZZES.length)}
        </p>
        <button 
          onClick={resetQuiz}
          className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black tracking-widest uppercase hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
        >
          {t.reset}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      key={currentQuizIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto space-y-10"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.question} {currentQuizIndex + 1} / {QUIZZES.length}</span>
        <div className="flex gap-1">
          {QUIZZES.map((_, idx) => (
            <div key={idx} className={cn("w-8 h-1 pr-1", idx <= currentQuizIndex ? "bg-blue-500" : "bg-slate-100")} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-2xl shadow-slate-100/50">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-snug mb-12">
          {lang === 'ko' ? currentQuiz.question : `Scenario training question ${currentQuizIndex + 1}: What is the correct analysis for this pattern?`}
        </h3>

        <div className="space-y-4">
          {currentQuiz.options.map((option, idx) => {
            const isCorrect = idx === currentQuiz.correctAnswer;
            const isSelected = idx === selectedOption;
            
            let btnClass = "w-full p-6 text-left rounded-3xl border-2 transition-all flex items-center justify-between ";
            if (!isAnswered) {
              btnClass += "border-slate-50 hover:border-blue-500 hover:bg-blue-50/50 text-slate-600 font-bold";
            } else {
              if (isCorrect) {
                btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900 font-black";
              } else if (isSelected) {
                btnClass += "border-rose-500 bg-rose-50 text-rose-900 font-black";
              } else {
                btnClass += "border-slate-50 text-slate-300 pointer-events-none";
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleOptionSelect(idx)}
                className={btnClass}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">{idx + 1}</span>
                  <span>{option}</span>
                </div>
                {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t.explanation}</span>
            </div>
            <p className="text-sm font-bold text-blue-800 leading-relaxed">
              {lang === 'ko' ? currentQuiz.explanation : "Technical indicators usually show clear signals when patterns repeat based on historical data analysis."}
            </p>
          </div>
          
          <button 
            onClick={handleNext}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black tracking-widest uppercase hover:bg-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3"
          >
            {currentQuizIndex < QUIZZES.length - 1 ? t.next : t.viewResult}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'quant' | 'trade' | 'assets' | 'notice' | 'requests' | 'history' | 'request-edit' | 'strategy-edit' | 'quiz' | 'test-results'>('quant');
  const [assetType, setAssetType] = useState<'domestic' | 'overseas' | 'cash'>('domestic');
  const [tradeType, setTradeType] = useState<'domestic' | 'overseas'>('domestic');
  const [quantType, setQuantType] = useState<'provided' | 'mine'>('provided');
  const [isAssetHovered, setIsAssetHovered] = useState(false);
  const [isTradeHovered, setIsTradeHovered] = useState(false);
  const [isQuantHovered, setIsQuantHovered] = useState(false);
  const [isServiceHovered, setIsServiceHovered] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedTestScenario, setSelectedTestScenario] = useState<string>(SCENARIOS[0].id);

  // --- Test Results Data ---
  const TEST_RESULTS_DATA: Record<string, { name: string; symbol: string; change: string; reason: string }[]> = {
    'ma-cross': [
      { name: '삼성전자', symbol: '005930', change: '+2.4%', reason: '5일선이 20일선을 상향 돌파하며 강한 매수 신호 포착' },
      { name: 'SK하이닉스', symbol: '000660', change: '+3.1%', reason: '정배열 진입 초기 단계로 추가 상승 모멘텀 확보' }
    ],
    'rsi-divergence': [
      { name: 'NAVER', symbol: '035420', change: '+1.2%', reason: '과매도 구간 탈출 및 RSI 상승 다이버전스 발생' },
      { name: '카카오', symbol: '035720', change: '-0.5%', reason: '바닥권 다지기 진행 중, 지지선 확인 권장' }
    ],
    'bollinger-breakout': [
      { name: 'LG에너지솔루션', symbol: '373220', change: '+4.5%', reason: '상단 밴드 돌파와 함께 거래량 실린 강한 추세 형성' }
    ],
    'magic-formula': [
      { name: '현대차', symbol: '005380', change: '+1.8%', reason: '저평가 매력 부각 및 높은 ROC 유지 중' }
    ]
  };

  const currentTestStocks = TEST_RESULTS_DATA[selectedTestScenario] || [];
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
  const [lang, setLang] = useState<'ko' | 'en'>('ko');

  const t = translations[lang];

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
                      {t.providedScenarios}
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
                      {t.myScenarios}
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab('test-results');
                        setIsQuantHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'test-results' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {t.testResults}
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
                {t.trade}
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
                      {t.domestic}
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
                      {t.overseas}
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
                {t.myAssets}
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
                      {t.depositDiv}
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
                      {t.domestic}
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
                      {t.overseas}
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
                {t.service}
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
                        setActiveTab('quiz');
                        setIsServiceHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                        activeTab === 'quiz' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      퀴즈
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
                    <button 
                      onClick={() => {
                        setActiveTab('notice');
                        setIsServiceHovered(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all relative",
                        activeTab === 'notice' ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {t.notice}
                        <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      </div>
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-6 ml-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl items-center">
              <button 
                onClick={() => setLang('ko')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black rounded-lg transition-all",
                  lang === 'ko' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                KO
              </button>
              <button 
                onClick={() => setLang('en')}
                className={cn(
                  "px-3 py-1.5 text-[9px] font-black rounded-lg transition-all",
                  lang === 'en' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                EN
              </button>
            </div>
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
          {activeTab !== 'assets' && activeTab !== 'notice' && activeTab !== 'history' && activeTab !== 'requests' && activeTab !== 'request-edit' && activeTab !== 'quiz' && activeTab !== 'test-results' && (
            <div className="flex items-center gap-4 mb-10">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {activeTab === 'trade' 
                  ? (tradeType === 'domestic' ? t.domestic : t.overseas)
                  : (quantType === 'provided' ? t.providedScenarios : t.myScenarios)}
              </h1>
            </div>
          )}

          {activeTab === 'test-results' ? (
            <div className="flex flex-col gap-10">
              <div className="flex items-center gap-4 mb-2">
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                <h1 className="text-xl font-black text-slate-900 tracking-tight">전략 시뮬레이션 테스트 결과</h1>
              </div>
              <TestResultsView 
                scenarios={SCENARIOS}
                selectedScenarioId={selectedTestScenario}
                onSelectScenario={setSelectedTestScenario}
                stocks={currentTestStocks}
                t={t}
              />
            </div>
          ) : activeTab === 'assets' ? (
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
              onDeposit={(amount, currency) => {
                if (currency === 'KRW') setCashKRW(prev => prev + amount);
                else setCashUSD(prev => prev + amount);

                const newTransaction = {
                  id: Math.random().toString(36).substr(2, 9),
                  date: new Date().toISOString(),
                  type: 'cash',
                  fromAmount: 0,
                  fromCurrency: 'EXTERNAL',
                  toAmount: amount,
                  toCurrency: currency,
                  action: 'DEPOSIT' as const
                };
                setTransactions(prev => [newTransaction, ...prev]);
              }}
              t={t}
            />
          ) : activeTab === 'history' ? (
            <HistoryView 
              transactions={transactions} 
              defaultType={historyType} 
              onBack={() => setActiveTab('assets')} 
            />
          ) : activeTab === 'quiz' ? (
            <QuizView t={t} lang={lang} />
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
          ) : activeTab === 'strategy-edit' ? (
            <StrategyEdit 
              onBack={() => setActiveTab('quant')} 
              onSave={() => {
                setActiveTab('quant');
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
              t={t}
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
              onAddStrategy={() => setActiveTab('strategy-edit')}
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
  onShowHistory,
  onAddStrategy
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
  onAddStrategy: () => void;
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
                <button 
                  onClick={onAddStrategy}
                  className="w-full p-6 border-4 border-dashed border-slate-50 rounded-3xl flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-blue-400 hover:border-blue-100 hover:bg-blue-50/10 transition-all group"
                >
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

          {/* Magic Formula Result Table */}
          <AnimatePresence>
            {appliedScenarios.includes('magic-formula') && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-100/50"
              >
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 bg-pink-50 rounded-3xl flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Magic Formula Analytics</h3>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-1">마법의 공식 전략 분석 결과</p>
                  </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar pb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-100">
                        <th className="px-8 py-6 text-left text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">ROC (우량성)</th>
                        <th className="px-8 py-6 text-left text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">EV/EBITDA (저렴함)</th>
                        <th className="px-8 py-6 text-left text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">마법 공식 점수</th>
                        <th className="px-8 py-6 text-left text-[12px] font-black text-slate-300 uppercase tracking-[0.2em]">매수 타이밍 (백테스트 결과)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {MAGIC_FORMULA_DATA.map((row, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-all border-b border-transparent hover:border-slate-100">
                          <td className="px-8 py-10">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{row.roc}</span>
                          </td>
                          <td className="px-8 py-10">
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{row.evEbitda}</span>
                          </td>
                          <td className="px-8 py-10">
                            <span className="text-3xl font-black text-blue-600 tracking-tighter font-mono">{row.score}</span>
                          </td>
                          <td className="px-8 py-10 whitespace-nowrap">
                            <span className={cn("text-lg font-black tracking-tight", row.color)}>
                              {row.timing}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
  const [isMyRequestOnly, setIsMyRequestOnly] = useState(false);

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
      
      const isMyReq = isMyRequestOnly ? (r.id === '1' || r.id === '3' || r.id === '5') : true;
      
      return matchesSearch && matchesStart && matchesEnd && isMyReq;
    });
  }, [requests, searchQuery, startDate, endDate, isMyRequestOnly]);

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
          <button 
            onClick={() => {
              setIsMyRequestOnly(!isMyRequestOnly);
              setCurrentPage(1);
            }}
            className={cn(
              "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
              isMyRequestOnly 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
          >
            [나의요청]
          </button>
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
  onOpenHistory,
  onDeposit,
  t
}: { 
  type: 'domestic' | 'overseas' | 'cash',
  cashKRW: number,
  cashUSD: number,
  divKRW: number,
  divUSD: number,
  domesticAssets: any[],
  overseasAssets: any[],
  onOpenExchange: (type: 'cash' | 'dividend') => void,
  onOpenHistory: (type: 'cash' | 'dividend') => void,
  onDeposit: (amount: number, currency: 'KRW' | 'USD') => void,
  t: any
}) => {
  const [isDepositMode, setIsDepositMode] = useState(false);
  const [depositCurrency, setDepositCurrency] = useState<'KRW' | 'USD'>('KRW');

  const assets = type === 'domestic' ? domesticAssets : type === 'overseas' ? overseasAssets : [];
  const currency = type === 'domestic' ? 'KRW' : 'USD';
  const totalValue = assets.reduce((acc, curr) => acc + (curr.currPrice * curr.q), 0);
  const totalProfit = assets.reduce((acc, curr) => acc + ((curr.currPrice - curr.avgPrice) * curr.q), 0);

  if (type === 'cash') {
    if (isDepositMode) {
      const presets = depositCurrency === 'KRW' 
        ? [10000, 50000, 100000, 500000, 1000000]
        : [10, 50, 100, 500, 1000];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-10"
        >
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDepositMode(false)}
              className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">{t.depositScreen}</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-100/50 space-y-12">
            <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] w-fit mx-auto">
              <button 
                onClick={() => setDepositCurrency('KRW')}
                className={cn(
                  "px-8 py-3 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all",
                  depositCurrency === 'KRW' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400"
                )}
              >
                KRW
              </button>
              <button 
                onClick={() => setDepositCurrency('USD')}
                className={cn(
                  "px-8 py-3 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest transition-all",
                  depositCurrency === 'USD' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400"
                )}
              >
                USD
              </button>
            </div>

            <div className="text-center space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.currentCash}</p>
              <p className="text-5xl font-black text-slate-900 tracking-tighter italic">
                {depositCurrency === 'KRW' ? cashKRW.toLocaleString() : cashUSD.toLocaleString()}
                <span className="text-xl font-bold text-slate-400 ml-3 italic">{depositCurrency}</span>
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">{t.selectAmount}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {presets.map(amount => (
                  <button 
                    key={amount}
                    onClick={() => {
                      onDeposit(amount, depositCurrency);
                      alert(`${amount.toLocaleString()} ${depositCurrency} 입금 완료되었습니다.`);
                    }}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-slate-900 group-hover:text-blue-600 tracking-tighter">+{amount.toLocaleString()}</span>
                      <span className="text-xs font-black text-slate-400 uppercase italic">{depositCurrency}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Section */}
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.cash}</h3>
              </div>
              <button 
                onClick={() => setIsDepositMode(true)}
                className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.deposit}
              </button>
            </div>
            
            <div className="flex-1 space-y-8 mb-10">
              <div className="group">
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                  {cashKRW.toLocaleString()} 
                  <span className="text-sm font-bold text-slate-400 ml-2 uppercase italic font-mono">KRW</span>
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Domestic Cash Balance</p>
              </div>
              <div className="pt-8 border-t border-slate-50 group">
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                  {cashUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                  <span className="text-sm font-bold text-slate-400 ml-2 uppercase italic font-mono">USD</span>
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Overseas Cash Balance</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => onOpenExchange('cash')} className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all">{t.exchange}</button>
              <button onClick={() => onOpenHistory('cash')} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 hover:text-slate-900 transition-all">{t.history}</button>
            </div>
          </div>

          {/* Dividend Section */}
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 flex flex-col">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.dividend}</h3>
            </div>

            <div className="flex-1 space-y-8 mb-10">
              <div className="group">
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                  {divKRW.toLocaleString()} 
                  <span className="text-sm font-bold text-slate-400 ml-2 uppercase italic font-mono">KRW</span>
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Domestic Dividends Total</p>
              </div>
              <div className="pt-8 border-t border-slate-50 group">
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                  {divUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                  <span className="text-sm font-bold text-slate-400 ml-2 uppercase italic font-mono">USD</span>
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Overseas Dividends Total</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => onOpenExchange('dividend')} className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-900 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-900 hover:text-white transition-all">{t.exchange}</button>
              <button onClick={() => onOpenHistory('dividend')} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black tracking-widest uppercase hover:bg-slate-200 hover:text-slate-900 transition-all">{t.history}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">{t.totalPortfolio}</h3>
          <p className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-4 italic">
            {totalValue.toLocaleString()} 
            <span className="text-sm font-bold text-slate-500 ml-2 uppercase tracking-widest italic font-mono">{currency}</span>
          </p>
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
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t.activePositions}</h3>
            <button 
              onClick={() => onOpenHistory('cash')}
              className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest"
            >
              {t.history}
            </button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.quantity}</th>
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
