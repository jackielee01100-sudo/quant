import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  Zap, 
  Layers, 
  Sparkles 
} from 'lucide-react';
import { format, subDays, addDays } from 'date-fns';
import { Quiz, Scenario, Stock, StockData } from '../types';

export const QUIZZES: Quiz[] = [
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

export const MAGIC_FORMULA_DATA = [
  { roc: '42% (A++)', evEbitda: '7.2배 (A)', score: '9.5 / 10', timing: '[골든크로스 대기]', color: 'text-emerald-600' },
  { roc: '35% (A)', evEbitda: '9.1배 (A-)', score: '9.0 / 10', timing: '[관망]', color: 'text-slate-500' },
  { roc: '18% (B)', evEbitda: '25.4배 (C)', score: '7.2 / 10', timing: '[분할 매도 권장]', color: 'text-amber-500' },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'ma-cross',
    name: '이동평균선 골든크로스',
    enName: 'MA Golden Cross',
    description: '단기 이평선(5일)이 장기 이평선(20일)을 상향 돌파할 때 매수 신호',
    enDescription: 'Buy signal when the 5-day MA crosses above the 20-day MA',
    icon: React.createElement(TrendingUp, { className: "w-4 h-4" }),
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
    icon: React.createElement(Activity, { className: "w-4 h-4" }),
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
    icon: React.createElement(Zap, { className: "w-4 h-4" }),
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
    icon: React.createElement(Layers, { className: "w-4 h-4" }),
    color: '#8B5CF6',
    createdAt: '2026-04-05',
    popularity: 92
  },
  {
    id: 'magic-formula',
    name: '마법의 공식 (Magic Formula)',
    enName: 'Magic Formula',
    description: '우량주(높은 ROC)를 싼 가격(높은 EV/EBIT)에 매수하는 조엘 그린블라트의 전략',
    enDescription: "Joel Greenblatt's strategy: buy quality stocks at cheap prices",
    icon: React.createElement(Sparkles, { className: "w-4 h-4" }),
    color: '#EC4899',
    createdAt: '2026-04-25',
    popularity: 99
  }
];

export const STOCKS: Stock[] = [
  { id: '1', name: '삼성전자', code: '005930', type: 'domestic' },
  { id: '2', name: 'SK하이닉스', code: '000660', type: 'domestic' },
  { id: '3', name: 'NAVER', code: '035420', type: 'domestic' },
  { id: '4', name: '현대차', code: '005380', type: 'domestic' },
  { id: '5', name: 'LG엔솔', code: '373220', type: 'domestic' },
  { id: '6', name: 'Apple', code: 'AAPL', type: 'overseas' },
  { id: '7', name: 'Vanguard S&P 500 ETF', code: 'VOO', type: 'overseas' },
  { id: '8', name: 'KODEX 200', code: '069500', type: 'domestic' },
];

export const generateMockData = (stockId: string): StockData[] => {
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

  return data.map((item, idx, arr) => {
    let ma5 = undefined;
    if (idx >= 4) {
      ma5 = Math.round(arr.slice(idx - 4, idx + 1).reduce((acc, curr) => acc + curr.price, 0) / 5);
    }
    let ma20 = undefined;
    if (idx >= 19) {
      ma20 = Math.round(arr.slice(idx - 19, idx + 1).reduce((acc, curr) => acc + curr.price, 0) / 20);
    }
    const rsi = 30 + Math.random() * 40;
    return { ...item, ma5, ma20, rsi };
  });
};
