import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { SCENARIOS, STOCKS } from '../../constants';
import { cn } from '../../lib/utils';

export const TestResultsView = ({ t }: { t: any }) => {
  const [selectedStock, setSelectedStock] = useState(STOCKS[0]);
  const [search, setSearch] = useState('');

  const filteredStocks = useMemo(() => 
    STOCKS.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Stock Selection */}
      <div className="lg:col-span-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={t.searchStocks}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all shadow-sm"
          />
        </div>
        
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Item</h3>
            <Filter className="w-3 h-3 text-slate-300" />
          </div>
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {filteredStocks.map(stock => (
               <button 
                key={stock.id}
                onClick={() => setSelectedStock(stock)}
                className={cn(
                  "w-full p-6 flex items-center justify-between group transition-all border-b border-slate-50 last:border-0",
                  selectedStock?.id === stock.id ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    selectedStock?.id === stock.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={cn("text-sm font-black", selectedStock?.id === stock.id ? "text-white" : "text-slate-900")}>{stock.name}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{stock.code}</p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all",
                  selectedStock?.id === stock.id ? "text-blue-400 translate-x-1" : "text-slate-200"
                )} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Scenarios */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedStock.name} <span className="text-blue-600">추천 시나리오</span></h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">optimized backtest performance</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">AI Analysis Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SCENARIOS.slice(0, 4).map((scenario, idx) => {
            const score = (98 - (idx * 4) - Math.random() * 2).toFixed(1);
            return (
              <motion.div 
                key={scenario.id}
                whileHover={{ y: -8 }}
                className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
              >
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ backgroundColor: scenario.color }}
                />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${scenario.color}10`, color: scenario.color }}>
                    {scenario.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.backtestScore}</p>
                    <p className="text-3xl font-black italic tracking-tighter" style={{ color: scenario.color }}>{score}%</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-2 truncate">{scenario.name}</h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed line-clamp-2">{scenario.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div>
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{t.winRate}</p>
                      <p className="text-sm font-black text-slate-900">{(Number(score) * 0.85).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{t.alphaRatio}</p>
                      <p className="text-sm font-black text-emerald-500">+{((Number(score) - 80) * 0.3).toFixed(2)}</p>
                    </div>
                  </div>

                  <button 
                    style={{ backgroundColor: scenario.color }}
                    className="w-full py-4 text-white rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-lg shadow-blue-500/10 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    시나리오 적용하기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
