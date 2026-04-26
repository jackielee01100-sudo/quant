import React from 'react';
import { motion } from 'motion/react';
import { Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Scenario } from '../../types';

export const ScenarioItem = ({ 
  scenario, 
  onApply, 
  isApplied 
}: { 
  scenario: Scenario; 
  onApply: (id: string) => void;
  isApplied: boolean;
}) => {
  return (
    <motion.div
      layoutId={scenario.id}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.4}
      whileDrag={{ scale: 1.05, zIndex: 50, cursor: 'grabbing' }}
      className={cn(
        "p-4 mb-3 border bg-white rounded-xl cursor-grab active:cursor-grabbing group transition-all shadow-sm",
        isApplied ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/10" : "border-slate-200 hover:border-blue-400 hover:shadow-md"
      )}
      onClick={() => onApply(scenario.id)}
    >
      <div className="flex items-start gap-4">
        <div 
          className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center" 
          style={{ backgroundColor: `${scenario.color}10`, color: scenario.color }}
        >
          {scenario.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 truncate">{scenario.name}</h4>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
            {scenario.description}
          </p>
        </div>
        {isApplied && (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: scenario.color }}
          >
            <Zap className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
