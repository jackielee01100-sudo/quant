import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Calendar, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const NoticeView = () => {
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const notices = [
    {
      id: 1,
      title: "서비스 서버 점검 안내 (05/01 02:00~06:00)",
      content: "더욱 안정적인 퀀트 분석 서비스를 제공하기 위해 서버 점검을 진행합니다. 해당 시간에는 서비스 이용이 일시 중단되오니 양해 부탁드립니다. 이번 점검은 데이터 정합성 강화와 보안 패치 적용을 포함하고 있습니다. 이용에 불편을 드려 대단히 죄송하며, 더욱 안정적인 서비스를 제공할 것을 약속드립니다.",
      date: "2024.04.24",
      category: "점검",
      isNew: true
    },
    {
      id: 2,
      title: "해외 주식 실시간 시세 제공 서비스 오픈",
      content: "미국 시장(NYSE, NASDAQ) 실시간 시세 제공 서비스가 정식 출시되었습니다. 이제 전 세계 주요 지수를 실시간 분석해 보세요. 그동안 지연 시세로 인한 분석의 어려움을 해소하고자 실시간 데이터 파이프라인을 구축하였습니다. 모든 서비스 이용자에게 기본적으로 제공되며, 향후 다양한 글로벌 지수로 확대할 예정입니다.",
      date: "2024.04.22",
      category: "업데이트",
      isNew: false
    },
    {
      id: 3,
      title: "개인정보 처리방침 개정 안내",
      content: "개정된 법령에 따라 당사의 개인정보 처리방침이 변경되었습니다. 자세한 내용은 전문을 확인해 주시기 바랍니다. 주요 변경 사항은 수집하는 개인정보 항목의 명확화와 제3자 제공 동의 절차의 간소화입니다. 변경된 방침은 공고일로부터 7일 뒤에 발효됩니다. ",
      date: "2024.04.15",
      category: "공지",
      isNew: false
    }
  ];

  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      const titleLower = notice.title.toLowerCase();
      const contentLower = notice.content.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const matchesSearch = titleLower.includes(queryLower) || contentLower.includes(queryLower);
      
      const noticeDate = new Date(notice.date.replace(/\./g, '-'));
      noticeDate.setHours(0, 0, 0, 0);

      const matchesStart = startDate === '' || noticeDate >= new Date(startDate);
      const matchesEnd = endDate === '' || noticeDate <= new Date(endDate);
      
      return matchesSearch && matchesStart && matchesEnd;
    });
  }, [searchQuery, startDate, endDate]);

  if (selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedNotice(null)}
            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">공지사항 상세</h2>
        </div>

        <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-6">
                 <span className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                  selectedNotice.category === "점검" ? "bg-rose-50 text-rose-500" : 
                  selectedNotice.category === "업데이트" ? "bg-blue-50 text-blue-500" : "bg-slate-100 text-slate-500"
                )}>
                  {selectedNotice.category}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{selectedNotice.date}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-8 leading-tight">
                {selectedNotice.title}
            </h3>
            <div className="text-base text-slate-600 leading-relaxed font-medium whitespace-pre-wrap py-8 border-t border-slate-50">
                {selectedNotice.content}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">서비스 공지사항</h2>
        <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">QuantLab Service Notices & Updates</p>
      </div>

      {/* Search and Date Filter */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="공지사항 제목이나 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl p-1 px-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
            <span className="text-slate-300 font-black">~</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent py-3 text-[11px] font-black text-slate-700 focus:outline-none"
            />
          </div>
          {(searchQuery || startDate || endDate) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => (
            <motion.div 
              key={notice.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedNotice(notice)}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                  notice.category === "점검" ? "bg-rose-50 text-rose-500" : 
                  notice.category === "업데이트" ? "bg-blue-50 text-blue-500" : "bg-slate-100 text-slate-500"
                )}>
                  {notice.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-bold">{notice.date}</span>
                {notice.isNew && (
                  <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">
                {notice.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                {notice.content}
              </p>
              <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                  자세히 보기
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[3rem]">
            <Search className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <p className="text-slate-400 font-bold tracking-tight">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl shadow-slate-300 hover:bg-blue-600 transition-all">
          더 많은 공지사항 보기
        </button>
      </div>
    </div>
  );
};
