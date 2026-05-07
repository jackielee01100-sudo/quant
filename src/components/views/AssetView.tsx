import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Plus, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AssetView = ({ 
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
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Korea Cash Balance</p>
              </div>
              <div className="pt-8 border-t border-slate-50 group">
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                  {cashUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                  <span className="text-sm font-bold text-slate-400 ml-2 uppercase italic font-mono">USD</span>
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">USA Cash Balance</p>
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
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Korea Dividends Total</p>
              </div>
              <div className="pt-8 border-t border-slate-50 group">
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                  {divUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} 
                  <span className="text-sm font-bold text-slate-400 ml-2 uppercase italic font-mono">USD</span>
                </p>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">USA Dividends Total</p>
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
