import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from "zustand";

const TIMER_STORAGE_KEY = 'logfit_active_workout_timer';

interface TimerState {
    workoutStartTime: number | null;   // real epoch ms — persisted
    workoutElapsed: number;            // derived: Date.now() - workoutStartTime
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

    /** Called once on app launch — rehydrates timer state from AsyncStorage if a workout was active */
    hydrateFromStorage: () => Promise<void>;
    /** Called when the app returns to the foreground — instantly snaps elapsed to real wall-clock diff */
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

        // Persist so a cold-start can restore the timer
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

            // Workout elapsed is always computed from real wall-clock time,
            // so backgrounding/killing the app doesn't lose time.
            if (s.isWorkoutActive && s.workoutStartTime) {
                nextWorkoutElapsed = Math.floor((Date.now() - s.workoutStartTime) / 1000);
            }

            // Rest timer still counts down tick-by-tick (it's meant to be
            // a short foreground countdown, and it auto-stops when done).
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

    /** Rehydrate on cold start (app was killed while workout was active) */
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

    /** Snap elapsed to current real value — call this when app returns to foreground */
    syncElapsed: () => {
        const { isWorkoutActive, workoutStartTime } = get();
        if (isWorkoutActive && workoutStartTime) {
            const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
            set({ workoutElapsed: elapsed });
        }
    },
}));