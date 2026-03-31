import React, { useState } from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';
import type { Challenge } from '../store/useAssessmentStore';
import { CheckCircle, Circle, ArrowLeft, Lock, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  challenge: Challenge;
}

export const Sidebar: React.FC<Props> = ({ challenge }) => {
  const currentId = useAssessmentStore((state) => state.currentExerciseId);
  const completed = useAssessmentStore((state) => state.completedExercises);
  const setExercise = useAssessmentStore((state) => state.setExercise);
  const setChallenge = useAssessmentStore((state) => state.setChallenge);
  const resetCurriculum = useAssessmentStore((state) => state.resetCurriculum);

  const [showResetModal, setShowResetModal] = useState(false);

  const handleConfirmReset = () => {
    resetCurriculum(challenge.exercises.map(e => e.id));
    setShowResetModal(false);
  };

  return (
    <>
      <div className="w-72 bg-zinc-950/80 backdrop-blur-xl flex-shrink-0 flex flex-col h-full border-r border-zinc-800/50 shadow-2xl z-20">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-zinc-800/40">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setChallenge(null)}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">{challenge.title}</h2>
        </div>

        {/* Exercise List */}
        <div className="p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold uppercase text-zinc-600 tracking-widest mb-3 px-2">
            Curriculum
          </h3>
          <div className="space-y-1">
            {challenge.exercises.map((q, i) => {
              const isCompleted = completed.includes(q.id);
              const isActive = q.id === currentId;
              const isLocked = i > 0 && !completed.includes(challenge.exercises[i - 1].id);

              return (
                <button
                  key={q.id}
                  onClick={() => { if (!isLocked) setExercise(q.id); }}
                  disabled={isLocked}
                  className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-all border outline-none text-sm
                    ${isActive
                      ? 'bg-white/5 border-zinc-700/50 text-white shadow-sm'
                      : isLocked
                        ? 'border-transparent text-zinc-600 cursor-not-allowed'
                        : 'border-transparent text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                    }`}
                >
                  {isLocked ? (
                    <Lock className="w-4 h-4 opacity-30 shrink-0" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 opacity-40 shrink-0" />
                  )}
                  <span className={`truncate flex-1 ${isLocked ? 'opacity-30' : ''}`}>{q.title}</span>
                  {isActive && (
                    <motion.div layoutId="sidebar-active" className="ml-2 w-1 h-3 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Per-curriculum Reset Footer */}
        <div className="p-4 border-t border-zinc-800/40">
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center justify-center gap-2 text-xs text-red-500/50 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 py-2 px-3 rounded-lg transition-colors outline-none"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset {challenge.title}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        title={`Reset "${challenge.title}"?`}
        message="Your saved code and progress for this curriculum will be cleared. Other challenges are unaffected."
        confirmLabel="Reset Curriculum"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </>
  );
};
