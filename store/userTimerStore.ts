import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";

const TIMER_STORAGE_KEY = 'logfit_active_workout_timer';

interface TimerState {
    workoutStartTime: number | null;
    workoutElapsed: number;
    isWorkoutActive: boolean;
    activeWorkoutId: string | null;
    activeRoutineName: string | null;

    restTimeLeft: number;
    restTotalTime: number;
    isResting: boolean;

    startWorkout: (id: string, name: string) => void;
    finishWorkout: () => void;
    startRest: (seconds: number) => void;
    stopRest: () => void;
    tick: () => void;

    hydrateFromStorage: () => Promise<void>;
    syncElapsed: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    workoutStartTime: null,
    workoutElapsed: 0,
    isWorkoutActive: false,
    activeWorkoutId: null,
    activeRoutineName: null,
    restTimeLeft: 0,
    restTotalTime: 0,
    isResting: false,

    startWorkout: (id, name) => {
        const startTime = Date.now();

        AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
            workoutStartTime: startTime,
            activeWorkoutId: id,
            activeRoutineName: name,
            isWorkoutActive: true,
        }));

        set({
            workoutStartTime: startTime,
            workoutElapsed: 0,
            isWorkoutActive: true,
            activeWorkoutId: id,
            activeRoutineName: name,
        });
    },

    finishWorkout: () => {
        AsyncStorage.removeItem(TIMER_STORAGE_KEY);
        set({
            isWorkoutActive: false,
            isResting: false,
            workoutStartTime: null,
            workoutElapsed: 0,
            activeWorkoutId: null,
            activeRoutineName: null,
        });
    },

    startRest: (seconds) => {
        set({ restTimeLeft: seconds, restTotalTime: seconds, isResting: true });
    },

    stopRest: () => {
        set({ isResting: false, restTimeLeft: 0 });
    },

    tick: () => {
        const state = get();
        if (!state.isWorkoutActive && !state.isResting) return;

        set((s) => {
            let nextWorkoutElapsed = s.workoutElapsed;
            let nextRestTimeLeft = s.restTimeLeft;
            let nextIsResting = s.isResting;
            if (s.isWorkoutActive && s.workoutStartTime) {
                nextWorkoutElapsed = Math.floor((Date.now() - s.workoutStartTime) / 1000);
            }
            if (s.isResting) {
                if (s.restTimeLeft > 0) {
                    nextRestTimeLeft -= 1;
                } else {
                    nextIsResting = false;
                }
            }

            return {
                workoutElapsed: nextWorkoutElapsed,
                restTimeLeft: nextRestTimeLeft,
                isResting: nextIsResting,
            };
        });
    },

    hydrateFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
            if (!raw) return;

            const saved = JSON.parse(raw);
            const { workoutStartTime, activeWorkoutId, activeRoutineName, isWorkoutActive } = saved;

            if (isWorkoutActive && workoutStartTime) {
                const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
                set({
                    workoutStartTime,
                    activeWorkoutId,
                    activeRoutineName,
                    isWorkoutActive: true,
                    workoutElapsed: elapsed,
                });
            }
        } catch (e) {
            console.error('Failed to rehydrate timer:', e);
        }
    },

    syncElapsed: () => {
        const { isWorkoutActive, workoutStartTime } = get();
        if (isWorkoutActive && workoutStartTime) {
            const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
            set({ workoutElapsed: elapsed });
        }
    },
}));