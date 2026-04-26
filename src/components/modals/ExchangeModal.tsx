import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, ChevronRight, ArrowRight } from 'lucide-react';

export const ExchangeModal = ({ 
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
