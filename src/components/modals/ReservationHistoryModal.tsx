import React from 'react';
import { motion } from 'motion/react';
import { Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { STOCKS, SCENARIOS } from '../../constants';

export const ReservationHistoryModal = ({ 
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
