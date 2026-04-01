import { useState } from 'react';
import { SplitPaneLayout } from './layout/SplitPaneLayout';
import { EditorPane } from './components/EditorPane';
import { Dashboard } from './components/Dashboard';
import { QuestionPanel } from './components/QuestionPanel';
import { TerminalPane } from './components/TerminalPane';
import { Sidebar } from './components/Sidebar';
import { MobileIDE } from './components/MobileIDE';
import { useAssessmentStore } from './store/useAssessmentStore';
import type { Challenge } from './store/useAssessmentStore';
import { motion, AnimatePresence } from 'framer-motion';
import questionsData from './data/questions.json';

function App() {
  const [challenges] = useState<Challenge[]>(questionsData as Challenge[]);
  const currentChallengeId = useAssessmentStore((state) => state.currentChallengeId);
  const currentExerciseId = useAssessmentStore((state) => state.currentExerciseId);

  if (challenges.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white font-mono"
      >
        Loading Sandbox...
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!currentChallengeId ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen">
          <Dashboard challenges={challenges} />
        </motion.div>
      ) : (
        (() => {
          const activeChallenge = challenges.find((c) => c.id === currentChallengeId) || challenges[0];
          const activeExercise = activeChallenge.exercises.find((e) => e.id === currentExerciseId) || activeChallenge.exercises[0];

          return (
            <motion.div key="sandbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-screen flex bg-zinc-950 overflow-hidden">

              {/* Desktop: full 3-column layout */}
              <div className="hidden md:flex w-full h-full">
                <Sidebar challenge={activeChallenge} />
                <div className="flex-1 min-w-0 h-full relative">
                  <SplitPaneLayout
                    leftPane={<EditorPane questionId={activeExercise.id} boilerplate={activeExercise.boilerplate} />}
                    topRightPane={<QuestionPanel challenge={activeChallenge} />}
                    bottomRightPane={<TerminalPane currentQuestion={activeExercise} currentChallenge={activeChallenge} />}
                  />
                </div>
              </div>

              {/* Mobile: tab-based layout */}
              <div className="flex md:hidden w-full h-full">
                <MobileIDE
                  challenge={activeChallenge}
                  exercise={activeExercise}
                />
              </div>

            </motion.div>
          );
        })()
      )}
    </AnimatePresence>
  );
}

export default App;
