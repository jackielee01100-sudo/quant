import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, RefreshCw, ChevronRight } from 'lucide-react';
import { QUIZZES } from '../../constants';
import { cn } from '../../lib/utils';

export const QuizView = ({ lang, t }: { lang: 'ko' | 'en', t: any }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const quiz = QUIZZES[currentIdx];

  const handleNext = () => {
    if (selectedAnswer === quiz.correctAnswer) {
      setScore(score + 1);
    }
    
    if (currentIdx < QUIZZES.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
      setIsConfirmed(false);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsConfirmed(false);
  };

  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-blue-200">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{t.learningComplete}</h2>
        <p className="text-xl font-bold text-slate-500">{t.resultText(score, QUIZZES.length)}</p>
        <button 
          onClick={resetQuiz}
          className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] text-sm font-black tracking-widest uppercase shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-3 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          {t.reset}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
          {t.question} {currentIdx + 1} / {QUIZZES.length}
        </span>
        <div className="flex gap-1">
          {QUIZZES.map((_, i) => (
            <div key={i} className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentIdx ? "w-8 bg-blue-600" : i < currentIdx ? "w-4 bg-blue-200" : "w-4 bg-slate-100"
            )} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            <h3 className="text-2xl font-black text-slate-900 leading-snug tracking-tight">
              {lang === 'ko' ? quiz.question : quiz.enQuestion}
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {(lang === 'ko' ? quiz.options : quiz.enOptions).map((option, i) => (
                <button
                  key={i}
                  disabled={isConfirmed}
                  onClick={() => setSelectedAnswer(i)}
                  className={cn(
                    "p-6 rounded-2xl border-2 text-left transition-all relative group",
                    selectedAnswer === i 
                      ? (isConfirmed 
                          ? (i === quiz.correctAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-900" : "border-rose-500 bg-rose-50 text-rose-900")
                          : "border-blue-600 bg-blue-50 text-blue-900 shadow-xl shadow-blue-500/10"
                        )
                      : "border-slate-100 hover:border-slate-300 text-slate-600 bg-slate-50/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                      selectedAnswer === i ? "bg-blue-600 text-white" : "bg-white text-slate-400 group-hover:text-slate-900"
                    )}>{i + 1}</span>
                    <span className="font-bold">{option}</span>
                  </div>
                  {isConfirmed && i === quiz.correctAnswer && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                      Correct Answer
                    </div>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {isConfirmed && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-3"
                >
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.explanation}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed">
                    {lang === 'ko' ? quiz.explanation : quiz.enExplanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6">
              {!isConfirmed ? (
                <button 
                  disabled={selectedAnswer === null}
                  onClick={() => setIsConfirmed(true)}
                  className="w-full py-6 bg-slate-900 disabled:opacity-30 text-white rounded-[2rem] text-sm font-black tracking-widest uppercase hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                >
                  {t.confirm}
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  className="w-full py-6 bg-blue-600 text-white rounded-[2rem] text-sm font-black tracking-widest uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                >
                  {currentIdx === QUIZZES.length - 1 ? t.viewResult : t.next}
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
