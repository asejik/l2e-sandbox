import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  boilerplate: string;
  expectedOutput: string;
  requiredCodeRegex?: string[];
  forbiddenCodeRegex?: string[];
  isSubjective?: boolean;
  minWords?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
}

interface AssessmentState {
  currentChallengeId: string | null;
  currentExerciseId: string | null;
  completedExercises: string[];
  userCode: Record<string, string>; // Maps exerciseId -> code
  setChallenge: (id: string | null) => void;
  setExercise: (id: string) => void;
  markCompleted: (id: string) => void;
  updateCode: (id: string, code: string) => void;
  resetCurriculum: (exerciseIds: string[]) => void;
}

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set) => ({
      currentChallengeId: null,
      currentExerciseId: null,
      completedExercises: [],
      userCode: {},
      setChallenge: (id) => set({ currentChallengeId: id }),
      setExercise: (id) => set({ currentExerciseId: id }),
      markCompleted: (id) =>
        set((state) => ({
          completedExercises: state.completedExercises.includes(id)
            ? state.completedExercises
            : [...state.completedExercises, id],
        })),
      updateCode: (id, code) =>
        set((state) => ({
          userCode: { ...state.userCode, [id]: code },
        })),
      resetCurriculum: (exerciseIds) =>
        set((state) => {
          const newCompleted = state.completedExercises.filter(id => !exerciseIds.includes(id));
          const newUserCode = { ...state.userCode };
          exerciseIds.forEach(id => delete newUserCode[id]);
          return {
            completedExercises: newCompleted,
            userCode: newUserCode,
            currentExerciseId: exerciseIds[0] || state.currentExerciseId
          };
        }),
    }),
    {
      name: 'learn2earn-sandbox-v2', // unique name
    }
  )
);
