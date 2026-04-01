import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Play, Send, Loader2, BrainCircuit } from 'lucide-react';
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
  const [isValidating, setIsValidating] = useState(false);

  const codeMap = useAssessmentStore((state) => state.userCode);
  const markCompleted = useAssessmentStore((state) => state.markCompleted);
  const setExercise = useAssessmentStore((state) => state.setExercise);
  const setChallenge = useAssessmentStore((state) => state.setChallenge);

  useEffect(() => {
    setOutput('');
    setErrorMsg('');
    setLastRunCode(null);
    setShowFeedbackModal(false);
    setIsValidating(false);
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
      // Quick sanity check before hitting the API
      const boilerplateWords = currentQuestion.boilerplate.split(/\s+/).filter(w => w.length > 0).length;
      const totalWords = currentCode.split(/\s+/).filter(w => w.length > 0).length;
      const newWords = totalWords - boilerplateWords;
      const minWords = currentQuestion.minWords || 20;
      if (newWords < minWords) {
        setErrorMsg(`Test Failed.\nYour explanation is too short — only ~${newWords} new words detected.\nPlease write at least ${minWords} words explaining the concept.`);
        setOutput('');
        return;
      }

      // AI validation
      setIsValidating(true);
      setErrorMsg('');
      setOutput('');
      try {
        const res = await fetch('/api/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentQuestion.title,
            description: currentQuestion.description,
            answer: currentCode,
          }),
        });
        const result = await res.json();
        setIsValidating(false);
        if (result.valid) {
          setOutput(`✓ AI Mentor: ${result.feedback}`);
          setShowFeedbackModal(true);
        } else {
          setErrorMsg(`Answer Not Accepted.\n\nAI Mentor Feedback:\n${result.feedback}\n\nPlease revise your explanation and resubmit.`);
        }
      } catch {
        setIsValidating(false);
        setErrorMsg('Could not reach the AI validator. Check your connection and try again.');
      }
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
            {!currentQuestion.isSubjective && (
              <button
                onClick={handleRun}
                disabled={compileMutation.isPending}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-medium hover:bg-zinc-800 transition-colors text-zinc-300 disabled:opacity-50 border outline-none border-transparent"
              >
                {compileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" /> : <Play className="w-4 h-4 text-zinc-400" />}
                Run
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={compileMutation.isPending || isValidating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-sans font-medium transition-colors disabled:opacity-50 border outline-none
                ${currentQuestion.isSubjective
                  ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                }`}
            >
              {isValidating
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : currentQuestion.isSubjective
                  ? <BrainCircuit className="w-4 h-4" />
                  : <Send className="w-4 h-4" />
              }
              {isValidating ? 'Reviewing…' : currentQuestion.isSubjective ? 'Submit to AI' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Terminal Output */}
        <div className="flex-1 p-4 overflow-y-auto text-sm">
          {(compileMutation.isPending && !output && !errorMsg) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-500 flex items-center gap-2">
               Compiling...
            </motion.div>
          )}

          {isValidating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-indigo-400 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 animate-pulse" />
              AI is reviewing your answer…
            </motion.div>
          )}

          {errorMsg ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 whitespace-pre-wrap">
              {errorMsg}
            </motion.div>
          ) : output ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`whitespace-pre-wrap ${output.startsWith('✓') ? 'text-emerald-400' : 'text-zinc-300'}`}>
              {output}
            </motion.div>
          ) : null}

          {!output && !errorMsg && !compileMutation.isPending && !isValidating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-600">
              {currentQuestion.isSubjective ? '$ awaiting your explanation…' : '$ go run main.go'}
              <span className="block mt-2 opacity-50 animate-pulse">_</span>
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
