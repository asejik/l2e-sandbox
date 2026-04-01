import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Code2, List, Terminal } from 'lucide-react';
import type { Challenge, Exercise } from '../store/useAssessmentStore';
import { Sidebar } from './Sidebar';
import { EditorPane } from './EditorPane';
import { QuestionPanel } from './QuestionPanel';
import { TerminalPane } from './TerminalPane';

type Tab = 'exercises' | 'code' | 'problem' | 'terminal';

const tabs: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: 'exercises', label: 'Exercises', Icon: List },
  { id: 'code',      label: 'Code',      Icon: Code2 },
  { id: 'problem',   label: 'Problem',   Icon: BookOpen },
  { id: 'terminal',  label: 'Terminal',  Icon: Terminal },
];

interface Props {
  challenge: Challenge;
  exercise: Exercise;
}

export const MobileIDE: React.FC<Props> = ({ challenge, exercise }) => {
  const [activeTab, setActiveTab] = useState<Tab>('code');

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950 overflow-hidden">

      {/* Panel area — fills all space above the tab bar */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 overflow-hidden"
          >
            {activeTab === 'exercises' && (
              /* Pull Sidebar out of its sidebar container so it fills the full frame */
              <div className="w-full h-full overflow-y-auto">
                <Sidebar challenge={challenge} />
              </div>
            )}

            {activeTab === 'code' && (
              <EditorPane questionId={exercise.id} boilerplate={exercise.boilerplate} />
            )}

            {activeTab === 'problem' && (
              <div className="h-full overflow-y-auto bg-gradient-to-tr from-zinc-950 to-zinc-900/50">
                <QuestionPanel challenge={challenge} />
              </div>
            )}

            {activeTab === 'terminal' && (
              <TerminalPane currentQuestion={exercise} currentChallenge={challenge} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div className="flex-shrink-0 flex items-stretch border-t border-zinc-800/70 bg-zinc-900/80 backdrop-blur-xl safe-area-bottom">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors outline-none
                ${isActive
                  ? 'text-emerald-400'
                  : 'text-zinc-600 hover:text-zinc-400'
                }`}
            >
              <Icon className={`w-5 h-5 transition-all ${isActive ? 'scale-110' : ''}`} />
              <span className="tracking-wide">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute bottom-0 h-[2px] w-10 bg-emerald-500 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
