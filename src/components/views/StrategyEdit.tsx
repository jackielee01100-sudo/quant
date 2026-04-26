import React, { useState } from 'react';
import { ChevronRight, Plus, Rocket, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Scenario } from '../../types';

export const StrategyEdit = ({ 
  scenario, 
  onSave, 
  onDelete, 
  onBack,
  t
}: { 
  scenario?: Scenario, 
  onSave: (s: any) => void, 
  onDelete?: (id: string) => void,
  onBack: () => void,
  t: any
}) => {
  const [name, setName] = useState(scenario?.name || '');
  const [desc, setDesc] = useState(scenario?.description || '');
  const [color, setColor] = useState(scenario?.color || '#3B82F6');

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#0EA5E9', '#06B6D4'];

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
            {scenario ? '시나리오 편집' : '신규 시나리오 생성'}
          </h2>
        </div>
        
        {scenario && (
          <button 
            onClick={() => onDelete?.(scenario.id)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            {t.delete}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12">
            <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-100/50 space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Scenario Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex) 이동평균선 매매전략"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Description</label>
                  <textarea 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="시나리오에 대한 상세 설명을 입력하세요..."
                    className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl py-6 px-8 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Identity Color</label>
                  <div className="flex flex-wrap gap-4">
                    {colors.map(c => (
                      <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-12 h-12 rounded-2xl transition-all relative overflow-hidden",
                          color === c ? "ring-4 ring-offset-4 ring-slate-100 scale-110" : "hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Plus className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-10 border-t border-slate-50">
                  <button 
                    onClick={() => {
                        if (name.trim() && desc.trim()) {
                            onSave({
                                id: scenario?.id || Date.now().toString(),
                                name,
                                enName: name, // Simplified for now
                                description: desc,
                                enDescription: desc, // Simplified
                                color,
                                icon: React.createElement(Rocket, { className: "w-4 h-4" }),
                                createdAt: new Date().toISOString(),
                                popularity: 0
                            });
                        }
                    }}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-sm font-black tracking-widest uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Plus className="w-5 h-5" />
                    {scenario ? t.save : t.addStrategy}
                  </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
