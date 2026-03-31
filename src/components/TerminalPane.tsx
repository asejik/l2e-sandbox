import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '../store/useAssessmentStore';
import type { Challenge, Exercise } from '../store/useAssessmentStore';
import { FeedbackModal } from './FeedbackModal';

interface Props {
  currentQuestion: Exercise;
  currentChallenge: Challenge;
}

export const TerminalPane: React.FC<Props> = ({ currentQuestion, currentChallenge }) => {
  const [output, setOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [lastRunCode, setLastRunCode] = useState<string | null>(null);

  const codeMap = useAssessmentStore((state) => state.userCode);
  const markCompleted = useAssessmentStore((state) => state.markCompleted);
  const setExercise = useAssessmentStore((state) => state.setExercise);
  const setChallenge = useAssessmentStore((state) => state.setChallenge);

  useEffect(() => {
    setOutput('');
    setErrorMsg('');
    setLastRunCode(null);
    setShowFeedbackModal(false);
  }, [currentQuestion.id]);

  const currentCode = codeMap[currentQuestion.id] || currentQuestion.boilerplate;

  const compileMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error('Failed to compile');
      return res.json();
    },
    retry: 2,
    onSuccess: (data) => {
      if (data.Errors) {
        setErrorMsg(data.Errors);
        setOutput('');
      } else {
        setErrorMsg('');
        const rawOutput = data.Events?.map((e: any) => e.Message).join('') || '';
        setOutput(rawOutput);
        return rawOutput;
      }
    },
    onError: () => {
      setErrorMsg('Network or proxy error. Ensure /api/compile is running or internet is connected.');
      setOutput('');
    }
  });

  const handleRun = () => {
    setLastRunCode(null);
    compileMutation.mutate(currentCode, {
      onSuccess: (data) => {
         if (!data.Errors) {
             setLastRunCode(currentCode);
         }
      }
    });
  };

  const handleNextChallenge = () => {
    setShowFeedbackModal(false);
    markCompleted(currentQuestion.id);
    
    const currIndex = currentChallenge.exercises.findIndex(e => e.id === currentQuestion.id);
    const nextEx = currentChallenge.exercises[currIndex + 1];

    if (nextEx) {
       setExercise(nextEx.id);
    } else {
       setChallenge(null);
    }
  };

  const handleSubmit = async () => {
    if (currentCode !== lastRunCode) {
      setErrorMsg('Please Run the program first before submitting.');
      setOutput('');
      return;
    }

    // Static Analysis Guards
    // Strip comments so boilerplate instructions don't trigger false positives
    const codeToAnalyze = currentCode.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');

    if (currentQuestion.requiredCodeRegex) {
      for (const req of currentQuestion.requiredCodeRegex) {
        const regex = new RegExp(req);
        if (!regex.test(codeToAnalyze)) {
          setErrorMsg(`Test Failed.\nStatic Analysis: Your code must contain the required variable/pattern:\n"${req.replace(/\\b/g, '')}"\n\nPlease update your code and try again.`);
          setOutput('');
          return;
        }
      }
    }

    if (currentQuestion.forbiddenCodeRegex) {
      for (const forbidden of currentQuestion.forbiddenCodeRegex) {
        const regex = new RegExp(forbidden);
        if (regex.test(codeToAnalyze)) {
           setErrorMsg(`Test Failed.\nStatic Analysis: Your code contains forbidden implementation:\n"${forbidden.replace(/\\b/g, '')}"\n\nPlease update your code and try again.`);
           setOutput('');
           return;
        }
      }
    }

    if (currentQuestion.isSubjective) {
      const minRequired = (currentQuestion.minWords || 0) + currentQuestion.boilerplate.split(/\s+/).length;
      const wordCount = currentCode.split(/\s+/).filter(w => w.length > 0).length;
      if (currentQuestion.minWords && wordCount < minRequired) {
        setErrorMsg(`Test Failed.\nSubjective Answer: Your explanation must be at least ${currentQuestion.minWords} new words long.\nYou currently added roughly ${wordCount - currentQuestion.boilerplate.split(/\s+/).length} words.`);
        setOutput('');
        return;
      }
      setShowFeedbackModal(true);
      return;
    }

    if (output === currentQuestion.expectedOutput) {
      setShowFeedbackModal(true);
    } else {
      setErrorMsg(`Test Failed.\nExpected:\n${currentQuestion.expectedOutput}\nGot:\n${output}`);
      setOutput('');
    }
  };

  return (
    <>
      <div className="flex flex-col h-full bg-[#0d0d0d] font-mono border-t border-zinc-900 group">
        {/* Terminal Toolbar */}
        <div className="flex items-center justify-between px-4 h-12 bg-zinc-900/30 border-b border-zinc-800/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
            <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRun}
              disabled={compileMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-medium hover:bg-zinc-800 transition-colors text-zinc-300 disabled:opacity-50 border outline-none border-transparent"
            >
              {compileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : <Play className="w-4 h-4 text-zinc-400" />}
              Run
            </button>
            <button
              onClick={handleSubmit}
              disabled={compileMutation.isPending}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50 border outline-none border-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-4 overflow-y-auto text-sm">
          {compileMutation.isPending && !output && !errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 flex items-center gap-2">
               Compiling...
            </motion.div>
          )}
          
          {errorMsg ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 whitespace-pre-wrap">
              {errorMsg}
            </motion.div>
          ) : output ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-300 whitespace-pre-wrap">
              {output}
            </motion.div>
          ) : null}

          {!output && !errorMsg && !compileMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-600">
              $ go run main.go
              <span className="block mt-2 opacity-50 pulse animate-pulse">_</span>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showFeedbackModal && (
          <FeedbackModal 
            code={currentCode}
            title={currentQuestion.title}
            description={currentQuestion.description}
            onNext={handleNextChallenge}
          />
        )}
      </AnimatePresence>
    </>
  );
};
