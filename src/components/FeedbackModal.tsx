import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  code: string;
  title: string;
  description: string;
  onNext: () => void;
}

export const FeedbackModal: React.FC<Props> = ({ code, title, description, onNext }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, title, description })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
           setError(data.error || 'Failed to fetch AI review.');
           setIsLoading(false);
           return;
        }

        if (data.error) {
           setError(typeof data.error === 'string' ? data.error : data.error.message || 'AI API Error');
           setIsLoading(false);
           return;
        }

        if (data.choices && data.choices.length > 0) {
           setFeedback(data.choices[0].message.content);
        } else {
           setError('Invalid AI response format.');
        }
      } catch (err) {
        setError('Network error reaching review endpoint.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [code, title, description]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
             <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
               <CheckCircle2 className="w-8 h-8 text-emerald-500" />
             </div>
             <h2 className="text-3xl font-extrabold text-white tracking-tight">Challenge Passed!</h2>
             <p className="text-zinc-400">Excellent work! Let's review your approach.</p>
          </div>
          
          {/* AI Feedback Box */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 relative">
             <div className="absolute -top-3 left-6 px-2 bg-zinc-900 text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Mentor 
             </div>
             
             {isLoading ? (
               <div className="flex items-center gap-3 text-zinc-500 py-4">
                 <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                 Analyzing your implementation...
               </div>
             ) : error ? (
               <div className="text-red-400 text-sm py-2">
                 {error}
               </div>
             ) : (
               <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                 {feedback}
               </div>
             )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 md:p-8 pt-0 mt-auto flex-shrink-0">
          <button
            onClick={onNext}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Advance to Next Challenge <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
