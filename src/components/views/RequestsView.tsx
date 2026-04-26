import React, { useState, useMemo } from 'react';
import { Search, Calendar, RefreshCw, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRequest } from '../../types';

export const RequestsView = ({ 
  requests,
  onAdd,
  onSelect
}: { 
  requests: UserRequest[],
  onAdd: () => void,
  onSelect: (request: UserRequest) => void
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMyRequestOnly, setIsMyRequestOnly] = useState(false);

  const itemsPerPage = 5;
  
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const titleLower = r.title.toLowerCase();
      const contentLower = r.content.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = titleLower.includes(queryLower) || contentLower.includes(queryLower);
      
      const rDate = new Date(r.date);
      rDate.setHours(0, 0, 0, 0);
      
      const matchesStart = startDate === '' || rDate >= new Date(startDate);
      const matchesEnd = endDate === '' || rDate <= new Date(endDate);
      
      const isMyReq = isMyRequestOnly ? (r.id === '1' || r.id === '3' || r.id === '5') : true;
      
      return matchesSearch && matchesStart && matchesEnd && isMyReq;
    });
  }, [requests, searchQuery, startDate, endDate, isMyRequestOnly]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">서비스 요청사항</h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Your Feedback & Feature Requests</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="요청사항 제목이나 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsMyRequestOnly(!isMyRequestOnly);
              setCurrentPage(1);
            }}
            className={cn(
              "px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
              isMyRequestOnly 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
            )}
          >
            [나의요청]
          </button>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 px-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
            <span className="text-slate-300 font-black">~</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
          </div>
          {(searchQuery || startDate || endDate) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {currentRequests.length > 0 ? (
          currentRequests.map((r) => (
            <button 
              key={r.id}
              onClick={() => onSelect(r)}
              className="w-full text-left bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl hover:shadow-slate-200/50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {new Date(r.date).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                    r.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {r.status === 'completed' ? 'Reflected' : 'Pending'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
              <h4 className="text-lg font-black text-slate-900 mb-2 truncate">{r.title}</h4>
              <p className="text-sm font-bold text-slate-500 leading-relaxed truncate">{r.content}</p>
            </button>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold tracking-tight">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn(
                "w-12 h-12 rounded-2xl text-[10px] font-black transition-all",
                currentPage === page 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white border border-slate-200 text-slate-400 hover:border-slate-300"
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-10">
        <button 
          onClick={onAdd}
          className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black tracking-widest uppercase shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          신규 요청 작성
        </button>
      </div>
    </div>
  );
};
