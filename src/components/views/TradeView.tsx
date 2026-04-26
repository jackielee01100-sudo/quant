import React, { useState } from 'react';
import { Search, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { STOCKS } from '../../constants';

export const TradeView = ({ 
  type,
  cashKRW,
  cashUSD,
  onTrade,
  t
}: { 
  type: 'domestic' | 'overseas',
  cashKRW: number,
  cashUSD: number,
  onTrade: (stockId: string, q: number, p: number) => void,
  t: any
}) => {
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(STOCKS.find(s => s.type === type));
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('0');

  const filteredStocks = STOCKS.filter(s => 
    s.type === type && 
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()))
  );

  const marketPrice = 75000; // Mock market price
  const estimatedTotal = (Number(quantity) || 0) * (Number(price) || marketPrice);
  const currency = type === 'domestic' ? 'KRW' : 'USD';
  const balance = type === 'domestic' ? cashKRW : cashUSD;

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
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.recommendedStocks}</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredStocks.map(stock => (
              <button 
                key={stock.id}
                onClick={() => setSelectedStock(stock)}
                className={cn(
                  "w-full p-6 flex items-center justify-between group transition-all border-b border-slate-50 last:border-0",
                  selectedStock?.id === stock.id ? "bg-blue-50/50" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    selectedStock?.id === stock.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"
                  )}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-slate-900">{stock.name}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{stock.code}</p>
                  </div>
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-all",
                  selectedStock?.id === stock.id ? "text-blue-600 translate-x-1" : "text-slate-200 group-hover:text-slate-400"
                )} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Entry */}
      <div className="lg:col-span-8">
        <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
          
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.3em] bg-blue-50 px-3 py-1 rounded-full mb-3 inline-block">Order Terminal</span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedStock?.name} <span className="text-sm font-bold text-slate-400 uppercase ml-2">{selectedStock?.code}</span></h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.marketPrice}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter italic">{marketPrice.toLocaleString()} <span className="text-xs uppercase font-mono">{currency}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block px-1">{t.quantity}</label>
                <div className="relative group">
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-mono"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest">Share</span>
                </div>
                <div className="flex gap-2">
                  {[1, 5, 10, 50].map(val => (
                    <button 
                      key={val}
                      onClick={() => setQuantity(String(val))}
                      className="flex-1 py-2 bg-slate-100/50 text-[10px] font-black rounded-lg hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest"
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block px-1">{t.orderPrice}</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={price === '0' ? '' : price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={marketPrice.toString()}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-6 text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-mono"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 uppercase tracking-widest">{currency}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.availableBalance}</p>
                  <p className="text-xl font-black text-slate-600">{balance.toLocaleString()} <span className="text-[10px] italic">{currency}</span></p>
                </div>
                <div className="pt-6 border-t border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.estimatedTotal}</p>
                  <p className="text-3xl font-black text-blue-600 tracking-tighter italic">
                    {estimatedTotal.toLocaleString()} <span className="text-sm italic">{currency}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={() => {
                    if (selectedStock && quantity) {
                      onTrade(selectedStock.id, Number(quantity), Number(price) || marketPrice);
                      setQuantity('');
                    }
                  }}
                  className="flex-[2] py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black tracking-[0.2em] uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95"
                >
                  BUY ORDER
                </button>
                <button className="flex-1 py-6 bg-white border border-slate-200 text-slate-400 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all">
                  SELL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
