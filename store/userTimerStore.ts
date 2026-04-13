import { create } from "zustand";

interface TimerState {
    workoutStartTime: number | null;
    workoutElapsed: number;
    isWorkoutActive: boolean;

    restTimeLeft: number;
    restTotalTime: number;
    isResting: boolean;


    startWorkout: () => void;
    finishWorkout: () => void;
    startRest: (seconds: number) => void;
    stopRest: () => void;
    tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
    workoutStartTime: null,
    workoutElapsed: 0,
    isWorkoutActive: false,
    restTimeLeft: 0,
    restTotalTime: 0,
    isResting: false,

    startWorkout: () => {
        console.log("startWorkout called");
        set({ workoutStartTime: Date.now(), workoutElapsed: 0, isWorkoutActive: true })
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