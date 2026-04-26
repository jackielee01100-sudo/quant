import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, ChevronRight, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { SCENARIOS, STOCKS } from '../../constants';
import { cn } from '../../lib/utils';

export const TestResultsView = ({ t }: { t: any }) => {
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [marketType, setMarketType] = useState<'domestic' | 'overseas'>('domestic');
  const [search, setSearch] = useState('');

  const filteredStocks = useMemo(() => {
    const marketStocks = STOCKS.filter(s => s.type === marketType);
    return marketStocks
      .filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.code.toLowerCase().includes(search.toLowerCase())
      )
      .map(s => ({
        ...s,
        // Mock score based on scenario and stock id to keep it "stable" for the demo
        score: (95 - (parseInt(s.id) * 2) - (SCENARIOS.indexOf(selectedScenario) * 1.5) + Math.random()).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
  }, [marketType, search, selectedScenario]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Scenario Selection (Left) */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Strategy</h3>
            <Sparkles className="w-3 h-3 text-blue-500" />
          </div>
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {SCENARIOS.map(scenario => (
               <button 
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={cn(
                  "w-full p-6 flex items-center justify-between group transition-all border-b border-slate-50 last:border-0",
                  selectedScenario?.id === scenario.id ? "bg-slate-900 text-white" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm"
                    style={{ 
                        backgroundColor: selectedScenario?.id === scenario.id ? scenario.color : `${scenario.color}10`,
                        color: selectedScenario?.id === scenario.id ? 'white' : scenario.color
                    }}
                  >
                    {scenario.icon}
                  </div>
                  <div className="text-left">
                    <p className={cn("text-sm font-black", selectedScenario?.id === scenario.id ? "text-white" : "text-slate-900")}>{scenario.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Popularity: {scenario.popularity}%</p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all",
                  selectedScenario?.id === scenario.id ? "text-blue-400 translate-x-1" : "text-slate-200"
                )} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranked Stocks (Right) */}
      <div className="lg:col-span-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                <span style={{ color: selectedScenario.color }}>{selectedScenario.name}</span> <span className="text-slate-400">맞춤 종목 순위</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Best performing items for this strategy</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
                <button 
                  onClick={() => setMarketType('domestic')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all",
                    marketType === 'domestic' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  KOREA
                </button>
                <button 
                  onClick={() => setMarketType('overseas')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all",
                    marketType === 'overseas' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  USA
                </button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all w-40"
                />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredStocks.map((stock, idx) => (
            <motion.div 
              key={stock.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-lg font-black italic shadow-lg">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{stock.name}</h4>
                  <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{stock.code}</p>
                </div>
              </div>

              <div className="flex items-center gap-12">
                <div className="text-right">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Backtest Score</p>
                  <p className="text-2xl font-black italic text-slate-900 tracking-tighter" style={{ color: parseFloat(stock.score) > 90 ? selectedScenario.color : undefined }}>{stock.score}%</p>
                </div>
                
                <div className="hidden sm:block text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Recommendation</p>
                    <div className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        idx === 0 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                        {idx === 0 ? 'STRONG BUY' : idx < 3 ? 'ACCUMULATE' : 'HOLD'}
                    </div>
                </div>

                <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {filteredStocks.length === 0 && (
            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No matching stocks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
