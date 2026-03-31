import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from '../store/useAssessmentStore';
import type { Challenge } from '../store/useAssessmentStore';
import { ArrowRight, CheckCircle2, Trash2, RotateCcw } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  challenges: Challenge[];
}

export const Dashboard: React.FC<Props> = ({ challenges }) => {
  const setChallenge = useAssessmentStore((state) => state.setChallenge);
  const setExercise = useAssessmentStore((state) => state.setExercise);
  const completedExercises = useAssessmentStore((state) => state.completedExercises);
  const resetCurriculum = useAssessmentStore((state) => state.resetCurriculum);

  // Modal state: 'all' | challenge id | null
  const [confirmTarget, setConfirmTarget] = useState<'all' | string | null>(null);

  const totalExercisesGlobally = challenges.reduce((acc, c) => acc + c.exercises.length, 0);
  const totalCompletedGlobally = completedExercises.length;
  const globalProgress = totalExercisesGlobally > 0
    ? (totalCompletedGlobally / totalExercisesGlobally) * 100
    : 0;

  const handleConfirm = () => {
    if (confirmTarget === 'all') {
      localStorage.removeItem('learn2earn-sandbox-v2');
      window.location.reload();
    } else if (confirmTarget) {
      const target = challenges.find(c => c.id === confirmTarget);
      if (target) resetCurriculum(target.exercises.map(ex => ex.id));
    }
    setConfirmTarget(null);
  };

  const targetChallenge = challenges.find(c => c.id === confirmTarget);
  const modalTitle = confirmTarget === 'all'
    ? 'Reset All Progress?'
    : `Reset "${targetChallenge?.title}"?`;
  const modalMessage = confirmTarget === 'all'
    ? 'Every curriculum, all saved code, and all progress will be permanently cleared. This cannot be undone.'
    : 'Your saved code and progress for this curriculum will be cleared. Other challenges are unaffected.';
  const modalLabel = confirmTarget === 'all' ? 'Reset Everything' : 'Reset Curriculum';

  return (
    <div className="min-h-screen w-full text-zinc-100 p-8 flex flex-col items-center relative">

      {/* Top-right global reset */}
      <button
        onClick={() => setConfirmTarget('all')}
        className="absolute top-8 right-8 flex items-center gap-2 text-sm text-red-500/40 hover:text-red-400 bg-red-500/5 hover:bg-red-500/10 px-4 py-2 rounded-lg border border-transparent hover:border-red-500/10 transition-all outline-none"
      >
        <Trash2 className="w-4 h-4" /> Reset All
      </button>

      <div className="max-w-4xl w-full mt-16 mb-16">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Go Programming Sandbox
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Select a Challenge
          </h1>
          <p className="text-zinc-400 text-lg">
            Master Go by completing the guided exercises in each curriculum.
          </p>
        </motion.div>

        {/* Global Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 mb-10"
        >
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-zinc-200 font-semibold">Full Curriculum Progress</h2>
              <p className="text-zinc-500 text-xs mt-0.5">{totalCompletedGlobally} of {totalExercisesGlobally} exercises complete</p>
            </div>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">{Math.round(globalProgress)}%</span>
          </div>
          <div className="w-full bg-zinc-900/80 rounded-full h-2.5 overflow-hidden border border-zinc-800/50">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${globalProgress}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
            />
          </div>
        </motion.div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {challenges.map((challenge, index) => {
            const completedInChallenge = challenge.exercises.filter(ex => completedExercises.includes(ex.id)).length;
            const progress = (completedInChallenge / challenge.exercises.length) * 100;
            const isFullyCompleted = progress === 100;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
                onClick={() => {
                  setChallenge(challenge.id);
                  const firstIncomplete = challenge.exercises.find(ex => !completedExercises.includes(ex.id));
                  setExercise(firstIncomplete ? firstIncomplete.id : challenge.exercises[0].id);
                }}
                className="group cursor-pointer glass hover:bg-white/[0.06] rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.06)] hover:border-zinc-700/60"
              >

                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {challenge.title}
                    {isFullyCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 inline shrink-0" />}
                  </h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0
                    ${isFullyCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/60 text-zinc-500 group-hover:bg-white/10 group-hover:text-white'}`}>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-zinc-500 text-sm mb-6 line-clamp-2 h-10">{challenge.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-500">
                    <span>{completedInChallenge}/{challenge.exercises.length} Exercises</span>
                    <span className={isFullyCompleted ? 'text-emerald-400' : ''}>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-zinc-900/80 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                      className={`h-full rounded-full ${isFullyCompleted ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-indigo-600 to-indigo-400'}`}
                    />
                  </div>
                </div>

                {/* Visible per-card reset */}
                <div className="mt-5 pt-4 border-t border-zinc-800/50">
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmTarget(challenge.id); }}
                    className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-red-400 transition-colors outline-none"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset progress
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Shared confirm modal */}
      <ConfirmModal
        isOpen={confirmTarget !== null}
        title={modalTitle}
        message={modalMessage}
        confirmLabel={modalLabel}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-4xl pb-10 flex items-center justify-center"
      >
        <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-zinc-800/60 bg-white/[0.02] backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <p className="text-xs text-zinc-600 tracking-wide">
            Built by{' '}
            <span className="text-zinc-400 font-semibold">Sogo Ayenigba</span>
            <span className="mx-2 text-zinc-700">|</span>
            <span className="text-zinc-600 italic">For Internal Use</span>
          </p>
        </div>
      </motion.footer>
    </div>
  );
};
