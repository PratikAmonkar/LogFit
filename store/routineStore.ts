import { DatabaseRoutine, RoutineRepository } from "@/services/routineRepository";
import { create } from "zustand";

interface RoutineState {
    isLoading: boolean,
    data: DatabaseRoutine[] | [],
    getRoutines: () => Promise<void>,
    addRoutine: (routine: Omit<DatabaseRoutine, "id">) => Promise<void>,
    updateRoutine: (routine: DatabaseRoutine) => Promise<void>,
    deleteRoutine: (id: number) => Promise<void>,
}

export const useRoutineStore = create<RoutineState>((set) => ({
    isLoading: true,
    data: [],
    getRoutines: async () => {
        set({ isLoading: true });
        const data = await RoutineRepository.getAllRoutines();
        set({ data, isLoading: false });
    },
    addRoutine: async (routine) => {
        set({ isLoading: true });
        const id = await RoutineRepository.addRoutine(routine);
        set({ data: [...useRoutineStore.getState().data, { ...routine, id }], isLoading: false });
    },
    updateRoutine: async (routine) => {
        set({ isLoading: true });
        await RoutineRepository.updateRoutine(routine);
        set({ data: useRoutineStore.getState().data.map(r => r.id === routine.id ? routine : r), isLoading: false });
    },
    deleteRoutine: async (id) => {
        set({ isLoading: true });
        await RoutineRepository.deleteRoutine(id);
        set({ data: useRoutineStore.getState().data.filter(r => r.id !== id), isLoading: false });
    },
}))