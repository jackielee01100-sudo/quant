import React, { useState } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { UserRequest } from '../../types';

export const RequestEditorView = ({ 
  request,
  onBack,
  onSave,
  onDelete
}: { 
  request: UserRequest | null,
  onBack: () => void,
  onSave: (title: string, content: string) => void,
  onDelete: (id: string) => void
}) => {
  const [title, setTitle] = useState(request?.title || '');
  const [content, setContent] = useState(request?.content || '');

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
            {request ? '요청사항 상세' : '신규 요청 작성'}
          </h2>
        </div>

        {request && (
          <button 
            onClick={() => onDelete(request.id)}
            className="flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
          >
            <Plus className="w-4 h-4 rotate-45" />
            Delete
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/20 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">제목</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="요청 제목을 입력하세요"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">내용</label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상세 내용을 입력하세요..."
            className="w-full h-64 bg-slate-50 border border-slate-100 rounded-2xl py-6 px-8 text-base font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none leading-relaxed"
          />
        </div>

        <div className="pt-6">
          <button 
            onClick={() => {
              if (title.trim() && content.trim()) onSave(title, content);
            }}
            className="w-full py-6 bg-slate-900 text-white rounded-3xl text-sm font-black tracking-widest uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95"
          >
            {request ? '수정사항 저장' : '요청하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
