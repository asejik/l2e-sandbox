import React from 'react';
import { useAssessmentStore } from '../store/useAssessmentStore';
import type { Challenge } from '../store/useAssessmentStore';

interface Props {
  challenge: Challenge;
}

export const QuestionPanel: React.FC<Props> = ({ challenge }) => {
  const currentId = useAssessmentStore((state) => state.currentExerciseId);
  const activeExercise = challenge.exercises.find((q) => q.id === currentId) || challenge.exercises[0];

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 p-8 overflow-y-auto w-full">
      <h1 className="text-3xl font-extrabold tracking-tight mb-4 text-white">
        {activeExercise.title}
      </h1>
      
      <div className="h-px w-full bg-zinc-800/80 mb-6" />
      
      <div className="text-zinc-300 leading-relaxed flex-1 whitespace-pre-wrap text-base font-sans">
        {activeExercise.description}
      </div>
    </div>
  );
};
