import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Wallet, 
  Settings, 
  Search, 
  Bell, 
  User, 
  ChevronRight, 
  Zap, 
  ArrowRight,
  Globe,
  Plus
} from 'lucide-react';

// Types & Constants
import { Scenario, Stock, UserRequest, Transaction } from './types';
import { STOCKS, SCENARIOS, generateMockData } from './constants';
import { translations } from './translations';
import { cn } from './lib/utils';

// Common Components
import { CountdownTimer } from './components/common/CountdownTimer';

// Modals
import { ExchangeModal } from './components/modals/ExchangeModal';
import { ReservationHistoryModal } from './components/modals/ReservationHistoryModal';

// Views
import { QuantDashboard } from './components/views/QuantDashboard';
import { TradeView } from './components/views/TradeView';
import { AssetView } from './components/views/AssetView';
import { QuizView } from './components/views/QuizView';
import { RequestsView } from './components/views/RequestsView';
import { RequestEditorView } from './components/views/RequestEditorView';
import { HistoryView } from './components/views/HistoryView';
import { NoticeView } from './components/views/NoticeView';
import { TestResultsView } from './components/views/TestResultsView';
import { StrategyEdit } from './components/views/StrategyEdit';

function App() {
  // --- Persistent State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [activeTab, setActiveTab] = useState('quant');
  const [subTab, setSubTab] = useState('scenarios');
  
  // --- Data State ---
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [appliedScenarios, setAppliedScenarios] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [search, setSearch] = useState('');
  
  // --- Asset State ---
  const [cashKRW, setCashKRW] = useState(15740000);
  const [cashUSD, setCashUSD] = useState(4200.50);
  const [divKRW, setDivKRW] = useState(124000);
  const [divUSD, setDivUSD] = useState(85.20);
  const [domesticAssets, setDomesticAssets] = useState([
    { name: '삼성전자', code: '005930', q: 100, avgPrice: 72000, currPrice: 75000, profit: 4.17, currency: 'KRW' },
    { name: 'SK하이닉스', code: '000660', q: 50, avgPrice: 165000, currPrice: 180000, profit: 9.09, currency: 'KRW' }
  ]);
  const [overseasAssets, setOverseasAssets] = useState([
    { name: 'Apple', code: 'AAPL', q: 20, avgPrice: 175, currPrice: 190, profit: 8.57, currency: 'USD' }
  ]);
  
  // --- Modals & Views State ---
  const [showExchangeModal, setShowExchangeModal] = useState<null | 'cash' | 'dividend'>(null);
  const [showHistoryView, setShowHistoryView] = useState<null | 'cash' | 'dividend'>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservations, setReservations] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: new Date().toISOString(), type: 'cash', fromAmount: 1000000, fromCurrency: 'KB Bank', toAmount: 1000000, toCurrency: 'KRW', action: 'DEPOSIT' }
  ]);
  
  // --- Request State ---
  const [requests, setRequests] = useState<UserRequest[]>([
    { id: '1', date: '2024-04-20', title: '실시간 해외 시세 연동 요청', content: '미국 주식 실시간 시세가 필요합니다.', status: 'completed' },
    { id: '2', date: '2024-04-22', title: '다크모드 지원', content: '눈이 아파요 다크모드 해주세요.', status: 'pending' },
    { id: '3', date: '2024-04-23', title: '거래량 분석 시나리오 개선', content: '거래량 급증 기준을 설정 가능하게 해주세요.', status: 'pending' }
  ]);
  const [editingRequest, setEditingRequest] = useState<UserRequest | null>(null);
  const [isAddingRequest, setIsAddingRequest] = useState(false);
  
  // --- Strategy State ---
  const [editingStrategy, setEditingStrategy] = useState<Scenario | null>(null);
  const [isAddingStrategy, setIsAddingStrategy] = useState(false);

  // --- Translation Helper ---
  const t = useMemo(() => translations[lang], [lang]);

  // --- Derived Data ---
  const stockData = useMemo(() => generateMockData(selectedStock.id), [selectedStock]);

  // --- Handlers ---
  const handleApplyScenario = (id: string) => {
    setAppliedScenarios(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleTrade = (stockId: string, q: number, p: number) => {
    const stock = STOCKS.find(s => s.id === stockId);
    if (!stock) return;
    const total = q * p;
    if (stock.type === 'domestic' && total > cashKRW) return alert('잔고 부족');
    if (stock.type === 'overseas' && total > cashUSD) return alert('잔고 부족');
    
    if (stock.type === 'domestic') setCashKRW(prev => prev - total);
    else setCashUSD(prev => prev - total);
    
    alert(`${stock.name} ${q}주 주문 완료`);
  };

  const handleExchange = (val: number, direction: 'KtoU' | 'UtoK') => {
    const RATE = 1350;
    if (showExchangeModal === 'cash') {
      if (direction === 'KtoU') {
        setCashKRW(prev => prev - val);
        setCashUSD(prev => prev + (val / RATE));
      } else {
        setCashUSD(prev => prev - val);
        setCashKRW(prev => prev + (val * RATE));
      }
    } else {
       if (direction === 'KtoU') {
        setDivKRW(prev => prev - val);
        setDivUSD(prev => prev + (val / RATE));
      } else {
        setDivUSD(prev => prev - val);
        setDivKRW(prev => prev + (val * RATE));
      }
    }
    setTransactions(prev => [{
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: showExchangeModal as 'cash' | 'dividend',
      fromAmount: val,
      fromCurrency: direction === 'KtoU' ? 'KRW' : 'USD',
      toAmount: direction === 'KtoU' ? (val / RATE) : (val * RATE),
      toCurrency: direction === 'KtoU' ? 'USD' : 'KRW',
      action: 'EXCHANGE'
    }, ...prev]);
    setShowExchangeModal(null);
  };

  const handleDeposit = (amount: number, currency: 'KRW' | 'USD') => {
    if (currency === 'KRW') setCashKRW(prev => prev + amount);
    else setCashUSD(prev => prev + amount);
    
    setTransactions(prev => [{
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: 'cash',
      fromAmount: amount,
      fromCurrency: 'External Account',
      toAmount: amount,
      toCurrency: currency,
      action: 'DEPOSIT'
    }, ...prev]);
  };

  const handleSaveRequest = (title: string, content: string) => {
    if (editingRequest) {
      setRequests(prev => prev.map(r => r.id === editingRequest.id ? { ...r, title, content } : r));
    } else {
      setRequests(prev => [{ id: Date.now().toString(), title, content, date: new Date().toISOString(), status: 'pending' }, ...prev]);
    }
    setEditingRequest(null);
    setIsAddingRequest(false);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setEditingRequest(null);
  };

  const handleSaveStrategy = (s: Scenario) => {
    if (editingStrategy) {
      setScenarios(prev => prev.map(old => old.id === s.id ? s : old));
    } else {
      setScenarios(prev => [...prev, s]);
    }
    setEditingStrategy(null);
    setIsAddingStrategy(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('quant');
  };

  // --- Content Components ---
  const renderContent = () => {
    if (showHistoryView) {
      return <HistoryView transactions={transactions} defaultType={showHistoryView} onBack={() => setShowHistoryView(null)} />;
    }

    if (isAddingRequest || editingRequest) {
      return <RequestEditorView request={editingRequest} onBack={() => { setIsAddingRequest(false); setEditingRequest(null); }} onSave={handleSaveRequest} onDelete={handleDeleteRequest} />;
    }

    if (isAddingStrategy || editingStrategy) {
      return <StrategyEdit scenario={editingStrategy || undefined} onSave={handleSaveStrategy} onDelete={(id) => { setScenarios(prev => prev.filter(x => x.id !== id)); setEditingStrategy(null); }} onBack={() => { setIsAddingStrategy(false); setEditingStrategy(null); }} t={t} />;
    }

    switch (activeTab) {
      case 'quant':
        return (
          <QuantDashboard 
            search={search}
            setSearch={setSearch}
            scenarios={scenarios}
            appliedScenarios={appliedScenarios}
            handleApplyScenario={handleApplyScenario}
            onAddStrategy={() => setIsAddingStrategy(true)}
            onEditStrategy={(s) => setEditingStrategy(s)}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            stockData={stockData}
            onOpenReservation={() => setShowReservationModal(true)}
            t={t}
          />
        );
      case 'trade':
        return (
          <TradeView 
            type={subTab as 'domestic' | 'overseas'}
            cashKRW={cashKRW}
            cashUSD={cashUSD}
            onTrade={handleTrade}
            t={t}
          />
        );
      case 'assets':
        return (
          <AssetView 
            type={subTab as 'domestic' | 'overseas' | 'cash'}
            cashKRW={cashKRW}
            cashUSD={cashUSD}
            divKRW={divKRW}
            divUSD={divUSD}
            domesticAssets={domesticAssets}
            overseasAssets={overseasAssets}
            onOpenExchange={(type) => setShowExchangeModal(type)}
            onOpenHistory={(type) => setShowHistoryView(type)}
            onDeposit={handleDeposit}
            t={t}
          />
        );
      case 'service':
        if (subTab === 'quiz') return <QuizView lang={lang} t={t} />;
        if (subTab === 'requests') return <RequestsView requests={requests} onAdd={() => setIsAddingRequest(true)} onSelect={setEditingRequest} />;
        if (subTab === 'notice') return <NoticeView />;
        if (subTab === 'testResults') return <TestResultsView t={t} />;
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-3xl border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('quant')}>
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200 group-hover:bg-blue-600 transition-all">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase italic">QuantLab <span className="text-blue-600">.</span></h1>
            </div>

            <nav className="hidden xl:flex items-center gap-1">
              {[
                { id: 'quant', label: t.providedData, icon: Zap },
                { id: 'trade', label: t.trade, icon: BarChart3 },
                { id: 'assets', label: t.myAssets, icon: Wallet },
                { id: 'service', label: t.service, icon: Settings }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "relative px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all hover:bg-slate-100 flex items-center gap-2",
                    activeTab === item.id ? "text-blue-600" : "text-slate-400"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  {activeTab === item.id && (
                    <motion.div layoutId="activeNav" className="absolute bottom-0 left-6 right-6 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
               <button onClick={() => setLang('ko')} className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", lang === 'ko' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>KO</button>
               <button onClick={() => setLang('en')} className={cn("px-3 py-1 rounded-lg text-[10px] font-black transition-all", lang === 'en' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400")}>EN</button>
            </div>
            
            <CountdownTimer isLoggedIn={isLoggedIn} onLogout={handleLogout} />

            <div className="hidden md:flex items-center gap-2 pr-6 border-r border-slate-200">
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              </button>
              <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                <Globe className="w-5 h-5" />
              </button>
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-4 pl-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-900 leading-none">James K.</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Premium Member</p>
                </div>
                <button onClick={handleLogout} className="w-11 h-11 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                  <User className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoggedIn(true)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-200 transition-all active:scale-95">
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Navigation Overlapping Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Directory /</span>
               <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{activeTab} <span className="text-slate-300">/</span> {subTab}</h2>
            </div>

            <div className="flex bg-white/50 backdrop-blur-xl border border-slate-200/60 p-1.5 rounded-2xl shadow-xl shadow-slate-200/20">
                {activeTab === 'trade' && [
                    { id: 'domestic', label: t.domesticOrder },
                    { id: 'overseas', label: t.overseasOrder },
                    { id: 'history', label: t.orderHistory }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setSubTab(tab.id)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", subTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}>{tab.label}</button>
                ))}
                {activeTab === 'assets' && [
                    { id: 'cash', label: t.depositDiv },
                    { id: 'domestic', label: t.domestic },
                    { id: 'overseas', label: t.overseas }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setSubTab(tab.id)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", subTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}>{tab.label}</button>
                ))}
                {activeTab === 'service' && [
                    { id: 'quiz', label: t.quiz },
                    { id: 'notice', label: t.notice },
                    { id: 'requests', label: t.requests },
                    { id: 'testResults', label: t.testResults }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setSubTab(tab.id)} className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", subTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-600 relative")}>
                      {tab.label}
                      {tab.id === 'notice' && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                    </button>
                ))}
            </div>
        </div>

        {/* View Switcher with Animation */}
        <div className="relative">
          <AnimatePresence mode="wait">
             <motion.div
               key={`${activeTab}-${subTab}-${isAddingRequest}-${isAddingStrategy}-${showHistoryView}`}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
             >
               {renderContent()}
             </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals Container */}
      <AnimatePresence>
        {showExchangeModal && (
          <ExchangeModal 
            type={showExchangeModal}
            cashKRW={showExchangeModal === 'cash' ? cashKRW : divKRW}
            cashUSD={showExchangeModal === 'cash' ? cashUSD : divUSD}
            onClose={() => setShowExchangeModal(null)}
            onExchange={handleExchange}
          />
        )}
        {showReservationModal && (
          <ReservationHistoryModal 
            onClose={() => setShowReservationModal(false)}
            reservations={reservations}
            onCancel={(id) => setReservations(prev => prev.filter(r => r.id !== id))}
          />
        )}
      </AnimatePresence>

      <footer className="py-12 border-t border-slate-200 mt-20">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black italic text-slate-400">QUANTLAB SYSTEMS <span className="mx-2 opacity-30">|</span> 2026</h2>
          </div>
          <div className="flex gap-8">
            {['Terms', 'Privacy', 'Risk Disclosure', 'Support'].map(f => (
              <button key={f} className="text-[10px] font-black text-slate-300 hover:text-slate-900 uppercase tracking-widest transition-colors">{f}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
