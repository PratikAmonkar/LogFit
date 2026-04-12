import db from "./db";

export interface DatabaseRoutine {
    id?: number;
    name: string;
    days: string;
    duration: string;
}

export const RoutineRepository = {
    async getAllRoutines(): Promise<DatabaseRoutine[]> {
        return await db.getAllAsync<DatabaseRoutine>(
            "SELECT * FROM routines ORDER BY id ASC"
        );
    },

    async addRoutine(routine: Omit<DatabaseRoutine, "id">): Promise<number> {
        const result = await db.runAsync(
            "INSERT INTO routines (name, days, duration) VALUES (?, ?, ?)",
            routine.name,
            routine.days,
            routine.duration
        );
        return result.lastInsertRowId;
    },

    async updateRoutine(routine: DatabaseRoutine): Promise<void> {
        const { id, name, days, duration } = routine;
        if (!id) throw new Error("Routine ID is required for updates");

        await db.runAsync(
            "UPDATE routines SET name = ?, days = ?, duration = ? WHERE id = ?",
            name,
            days,
            duration,
            id
        );
    },

    async deleteRoutine(id: number): Promise<void> {
        await db.runAsync("DELETE FROM routines WHERE id = ?", id);
    },

    async getRoutineExercises(routineId: number): Promise<string[]> {
        const results = await db.getAllAsync<{ name: string }>(
            'SELECT name FROM routine_exercises WHERE routine_id = ?',
            routineId
        );
        return results.map(r => r.name);
    },

    async addExercisesToRoutine(routineId: number, exerciseNames: string[]): Promise<void> {
        for (const name of exerciseNames) {
            await db.runAsync(
                'INSERT INTO routine_exercises (routine_id, name) VALUES (?, ?)',
                routineId,
                name
            );
        }
    },

    async cloneTemplateToWorkout(routineId: number, workoutId: number) {
        const exercises = await this.getRoutineExercises(routineId);
        for (const name of exercises) {
            await db.runAsync(
                'INSERT INTO exercises (workout_id, name) VALUES (?, ?)',
                workoutId,
                name
            );
        }
    }
};