import { create } from "zustand";

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
        console.log("startWorkout called with:", id, name);
        set({ 
            workoutStartTime: Date.now(), 
            workoutElapsed: 0, 
            isWorkoutActive: true,
            activeWorkoutId: id,
            activeRoutineName: name
        })
    },
    finishWorkout: () => {
        console.log("finishWorkout called");
        set({ isWorkoutActive: false, isResting: false })
    },
    startRest: (seconds) => {
        console.log("startRest called");
        set({ restTimeLeft: seconds, restTotalTime: seconds, isResting: true })
    },
    stopRest: () => {
        console.log("stopRest called");
        set({ isResting: false, restTimeLeft: 0 })
    },
    tick: () => {
        console.log("tick called");
        const state = get();
        if (!state.isWorkoutActive && !state.isResting) return;
        set((state) => {
            let nextWorkoutElapsed = state.workoutElapsed;
            let nextRestTimeLeft = state.restTimeLeft;
            let nextIsResting = state.isResting;
            // Update Workout Timer
            if (state.isWorkoutActive) {
                nextWorkoutElapsed += 1;
            }
            // Update Rest Timer
            if (state.isResting) {
                if (state.restTimeLeft > 0) {
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
}))