import React, { useState } from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Transaction } from '../../types';

export const HistoryView = ({ 
  transactions,
  defaultType,
  onBack
}: { 
  transactions: Transaction[],
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
