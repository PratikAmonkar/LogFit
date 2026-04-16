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

    runningSet: { setId: number, exerciseName: string, startTime: number } | null;
    setElapsed: number;
    isSetTimerModalOpen: boolean;
    isStatusModalOpen: boolean;

    startWorkout: (id: string, name: string) => void;
    finishWorkout: () => void;
    startRest: (seconds: number) => void;
    stopRest: () => void;
    tick: () => void;

    startSetTimer: (setId: number, exerciseName: string) => void;
    stopSetTimer: () => void;
    toggleSetTimerModal: (val: boolean) => void;
    toggleStatusModal: (val: boolean) => void;

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
    runningSet: null,
    setElapsed: 0,
    isSetTimerModalOpen: false,
    isStatusModalOpen: false,

    startWorkout: (id, name) => {
        const startTime = Date.now();

        AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify({
            workoutStartTime: startTime,
            activeWorkoutId: id,
            activeRoutineName: name,
            isWorkoutActive: true,
            runningSet: null,
        }));

        set({
            workoutStartTime: startTime,
            workoutElapsed: 0,
            isWorkoutActive: true,
            activeWorkoutId: id,
            activeRoutineName: name,
            runningSet: null,
            setElapsed: 0,
            isSetTimerModalOpen: false,
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
            runningSet: null,
            setElapsed: 0,
            isSetTimerModalOpen: false,
        });
    },

    startRest: (seconds) => {
        set({ restTimeLeft: seconds, restTotalTime: seconds, isResting: true });
    },

    stopRest: () => {
        set({ isResting: false, restTimeLeft: 0 });
    },

    startSetTimer: (setId, exerciseName) => {
        const startTime = Date.now();
        const state = get();

        const updatedData = {
            workoutStartTime: state.workoutStartTime,
            activeWorkoutId: state.activeWorkoutId,
            activeRoutineName: state.activeRoutineName,
            isWorkoutActive: state.isWorkoutActive,
            runningSet: { setId, exerciseName, startTime }
        };

        AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedData));

        set({
            runningSet: { setId, exerciseName, startTime },
            setElapsed: 0,
            isSetTimerModalOpen: true
        });
    },

    stopSetTimer: () => {
        const state = get();
        const updatedData = {
            workoutStartTime: state.workoutStartTime,
            activeWorkoutId: state.activeWorkoutId,
            activeRoutineName: state.activeRoutineName,
            isWorkoutActive: state.isWorkoutActive,
            runningSet: null
        };

        AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedData));
        set({ runningSet: null, setElapsed: 0, isSetTimerModalOpen: false });
    },

    toggleSetTimerModal: (val) => {
        set({ isSetTimerModalOpen: val });
    },

    toggleStatusModal: (val) => {
        set({ isStatusModalOpen: val });
    },

    tick: () => {
        const state = get();
        if (!state.isWorkoutActive && !state.isResting && !state.runningSet) return;

        set((s) => {
            let nextWorkoutElapsed = s.workoutElapsed;
            let nextRestTimeLeft = s.restTimeLeft;
            let nextIsResting = s.isResting;
            let nextSetElapsed = s.setElapsed;

            if (s.isWorkoutActive && s.workoutStartTime) {
                nextWorkoutElapsed = Math.floor((Date.now() - s.workoutStartTime) / 1000);
            }

            if (s.runningSet) {
                nextSetElapsed = Math.floor((Date.now() - s.runningSet.startTime) / 1000);
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
                setElapsed: nextSetElapsed
            };
        });
    },

    hydrateFromStorage: async () => {
        try {
            const raw = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
            if (!raw) return;

            const saved = JSON.parse(raw);
            const { workoutStartTime, activeWorkoutId, activeRoutineName, isWorkoutActive, runningSet } = saved;

            const updates: Partial<TimerState> = {};

            if (isWorkoutActive && workoutStartTime) {
                const elapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
                Object.assign(updates, {
                    workoutStartTime,
                    activeWorkoutId,
                    activeRoutineName,
                    isWorkoutActive: true,
                    workoutElapsed: elapsed,
                });
            }

            if (runningSet && runningSet.startTime) {
                const elapsed = Math.floor((Date.now() - runningSet.startTime) / 1000);
                Object.assign(updates, {
                    runningSet,
                    setElapsed: elapsed,
                    isSetTimerModalOpen: true
                });
            }

            if (Object.keys(updates).length > 0) {
                set(updates as any);
            }
        } catch (e) {
            console.error('Failed to rehydrate timer:', e);
        }
    },

    syncElapsed: () => {
        const { isWorkoutActive, workoutStartTime, runningSet } = get();
        const updates: Partial<TimerState> = {};

        if (isWorkoutActive && workoutStartTime) {
            updates.workoutElapsed = Math.floor((Date.now() - workoutStartTime) / 1000);
        }

        if (runningSet) {
            updates.setElapsed = Math.floor((Date.now() - runningSet.startTime) / 1000);
        }

        if (Object.keys(updates).length > 0) {
            set(updates as any);
        }
    },
}));
