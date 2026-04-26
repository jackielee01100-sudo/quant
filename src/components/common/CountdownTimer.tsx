import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CountdownTimer = ({ 
  isLoggedIn, 
  onLogout 
}: { 
  isLoggedIn: boolean; 
  onLogout: () => void;
}) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (!isLoggedIn) {
      setTimeLeft(60);
      return;
    }

    const handleActivity = () => setTimeLeft(60);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, [isLoggedIn, onLogout]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
      <Clock className={cn("w-3.5 h-3.5 text-blue-600", isLoggedIn && "animate-pulse")} />
      <span className={cn(
        "text-[11px] font-black font-mono tabular-nums tracking-wider",
        timeLeft < 10 && isLoggedIn ? "text-rose-500" : "text-slate-700"
      )}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
