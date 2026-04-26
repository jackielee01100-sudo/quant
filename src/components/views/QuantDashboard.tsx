import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  CheckCircle2, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Clock,
  TrendingUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  Area, 
  AreaChart 
} from 'recharts';
import { cn } from '../../lib/utils';
import { ScenarioItem } from '../common/ScenarioItem';
import { MAGIC_FORMULA_DATA, SCENARIOS, STOCKS } from '../../constants';
import { StockData, Stock, Scenario } from '../../types';

export const QuantDashboard = ({
  search,
  setSearch,
  scenarios,
  appliedScenarios,
  handleApplyScenario,
  onAddStrategy,
  onEditStrategy,
  selectedStock,
  setSelectedStock,
  stockData,
  onOpenReservation,
  t
}: {
  search: string;
  setSearch: (s: string) => void;
  scenarios: Scenario[];
  appliedScenarios: string[];
  handleApplyScenario: (id: string) => void;
  onAddStrategy: () => void;
  onEditStrategy: (s: Scenario) => void;
  selectedStock: Stock;
  setSelectedStock: (s: Stock) => void;
  stockData: StockData[];
  onOpenReservation: () => void;
  t: any;
}) => {
  const filteredStocks = STOCKS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">
      {/* Sidebar: Scenarios & Items */}
      <div className="lg:col-span-3 space-y-8">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder={t.searchStocks}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all shadow-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.providedScenarios}</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">8 NEW</span>
          </div>
          {SCENARIOS.map(s => (
            <ScenarioItem 
              scenario={s} 
              onApply={handleApplyScenario}
              isApplied={appliedScenarios.includes(s.id)}
            />
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.myScenarios}</h3>
            <button key="add-btn" onClick={onAddStrategy} className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {scenarios.map(s => (
              <div key={s.id} className="relative group">
                <ScenarioItem 
                  scenario={s} 
                  onApply={handleApplyScenario}
                  isApplied={appliedScenarios.includes(s.id)}
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStrategy(s);
                  }}
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-slate-100 rounded-lg shadow-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/30 rounded-full blur-3xl -translate-y-10 translate-x-10" />
          <Sparkles className="w-6 h-6 text-blue-400 mb-6" />
          <h4 className="text-white text-base font-black mb-3 italic">AI Intelligence Report</h4>
          <p className="text-slate-400 text-xs leading-relaxed font-bold mb-8">
            현재 거시경제 지표와 20여개의 퀀트 시나리오를 결합한 결과, 반도체 섹터의 '골든크로스' 발생 확률이 85%로 상향되었습니다.
          </p>
          <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-sm">
            Read Insights
          </button>
        </div>
      </div>

      {/* Main Analysis Area */}
      <div className="lg:col-span-9 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedStock?.name}</h2>
              <span className="text-lg font-bold text-slate-300 font-mono italic uppercase">{selectedStock?.code}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-black">+4.2% Today</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 italic">Market Cap: 461.2T KRW</span>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] self-start lg:self-center shadow-inner">
            {filteredStocks.slice(0, 4).map(stock => (
              <button 
                key={stock.id}
                onClick={() => setSelectedStock(stock)}
                className={cn(
                  "px-6 py-2.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedStock?.id === stock.id ? "bg-white text-blue-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {stock.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-blue-500/5 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.marketPrice}</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">75,000 <span className="text-sm font-bold text-slate-300 uppercase italic ml-2">KRW</span></p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-purple-500/5 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Momentum</span>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-4xl font-black text-purple-600 tracking-tighter italic">82 <span className="text-sm font-bold text-slate-300 uppercase italic ml-2">HI</span></p>
          </div>
          <div className="bg-white border border-blue-100 rounded-[2.5rem] p-8 shadow-xl shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl -z-10" />
            <div className="flex items-center justify-between mb-6">
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest animate-pulse">AI Prediction</span>
              <div className="px-3 py-1 bg-blue-100/50 rounded-lg text-[9px] font-black text-blue-600 uppercase">BUY SIGNAL</div>
            </div>
            <p className="text-4xl font-black text-slate-900 tracking-tighter italic">91,200 <span className="text-sm font-bold text-slate-300 uppercase italic ml-2">E-TAR</span></p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Market Intelligence Chart</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time analysis stream</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MA5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MA20</span>
              </div>
            </div>
          </div>

          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                    padding: '20px',
                    fontSize: '12px',
                    fontWeight: 900
                  }} 
                />
                <Area type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={4} fillOpacity={1} fill="url(#colorPrice)" />
                <Line type="monotone" dataKey="ma5" stroke="#F59E0B" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="ma20" stroke="#8B5CF6" strokeWidth={2} dot={false} strokeDasharray="4 4" />
                
                {/* Signals */}
                {appliedScenarios.includes('ma-cross') && (
                  <ReferenceLine x={stockData[stockData.length - 10]?.date} stroke="#F43F5E" strokeWidth={2} label={{ value: 'BUY', position: 'top', fill: '#F43F5E', fontSize: 10, fontWeight: 900 }} />
                )}
                {appliedScenarios.includes('rsi-oversold') && (
                  <ReferenceLine x={stockData[stockData.length - 25]?.date} stroke="#10B981" strokeWidth={2} label={{ value: 'BOUNCE', position: 'top', fill: '#10B981', fontSize: 10, fontWeight: 900 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-12 flex justify-center">
            <button 
              onClick={onOpenReservation}
              className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
            >
              <Clock className="w-5 h-5" />
              {t.reserve} AI Strategy Order
            </button>
          </div>
        </div>

        {/* Magic Formula Section */}
        <AnimatePresence>
          {appliedScenarios.includes('magic-formula') && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/20 overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-10">
                <Sparkles className="w-8 h-8 text-pink-500" />
                <div>
                  <h3 className="text-xl font-black text-slate-900">조엘 그린블라트 마법의 공식 분석</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Value & Quality Metric Integration</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {MAGIC_FORMULA_DATA.map((item, i) => (
                  <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:border-pink-200 hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">RANK {i+1}</span>
                      <CheckCircle2 className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ROC (Capital Return)</p>
                        <p className="text-xl font-black text-slate-900 italic">{item.roc}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">EV / EBITDA</p>
                        <p className="text-xl font-black text-slate-900 italic">{item.evEbitda}</p>
                      </div>
                      <div className="pt-6 border-t border-slate-100 mt-6">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Quant Insight</p>
                        <p className={cn("text-xs font-black uppercase", item.color)}>{item.timing}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-10 p-6 bg-pink-50 rounded-2xl border border-pink-100">
                <p className="text-sm font-bold text-pink-700 italic leading-relaxed text-center">
                  "우량주(높은 자율이익율)를 싼 가격(높은 이익수익률)에 매수하는 것이 승리의 법입니다." - Joel Greenblatt
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
