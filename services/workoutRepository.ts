import db from './db';

export interface DatabaseSet {
  id?: number;
  exercise_id: number;
  weight: number;
  reps: number;
  duration: number;
  calories: number;
  distance: number;
  is_completed: number;
}

export interface DatabaseExercise {
  id?: number;
  workout_id: number;
  name: string;
}

export interface DatabaseWorkout {
  id?: number;
  title: string;
  date?: string;
  duration?: number;
}

export const WorkoutRepository = {
  async createWorkout(title: string): Promise<number> {
    const result = await db.runAsync('INSERT INTO workouts (title) VALUES (?)', title);
    return result.lastInsertRowId;
  },

  async getTodayWorkout(title: string): Promise<DatabaseWorkout | null> {
    return await db.getFirstAsync<DatabaseWorkout>(
      "SELECT * FROM workouts WHERE title = ? AND date >= date('now', 'start of day') AND is_completed = 0",
      [title]
    );
  },

  async getWorkoutById(id: number): Promise<DatabaseWorkout | null> {
    return await db.getFirstAsync<DatabaseWorkout>(
      "SELECT * FROM workouts WHERE id = ?",
      [id]
    );
  },

  async getAllWorkouts(): Promise<DatabaseWorkout[]> {
    return await db.getAllAsync<DatabaseWorkout>('SELECT * FROM workouts ORDER BY date DESC');
  },

  async getAnyActiveWorkoutToday(): Promise<DatabaseWorkout | null> {
    return await db.getFirstAsync<DatabaseWorkout>(
      "SELECT * FROM workouts WHERE date >= date('now', 'start of day') AND is_completed = 0 ORDER BY id DESC"
    );
  },

  async finishWorkout(id: number, duration: number = 0): Promise<void> {
    await db.runAsync('UPDATE workouts SET is_completed = 1, duration = ? WHERE id = ?', duration, id);
  },

  async deleteWorkout(id: number): Promise<void> {
    await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
  },

  async addExerciseToWorkout(workout_id: number, name: string): Promise<number> {
    const result = await db.runAsync(
      'INSERT INTO exercises (workout_id, name) VALUES (?, ?)',
      workout_id,
      name
    );
    return result.lastInsertRowId;
  },

  async getExercisesForWorkout(workout_id: number): Promise<DatabaseExercise[]> {
    return await db.getAllAsync<DatabaseExercise>(
      'SELECT * FROM exercises WHERE workout_id = ?',
      workout_id
    );
  },

  async addSetToExercise(exercise_id: number, weight: number, reps: number, duration: number = 0, calories: number = 0, distance: number = 0): Promise<number> {
    const result = await db.runAsync(
      'INSERT INTO sets (exercise_id, weight, reps, duration, calories, distance) VALUES (?, ?, ?, ?, ?, ?)',
      exercise_id,
      weight,
      reps,
      duration,
      calories,
      distance
    );
    return result.lastInsertRowId;
  },

  async updateSet(id: number, weight: number, reps: number, is_completed: number, duration: number = 0, calories: number = 0, distance: number = 0): Promise<void> {
    await db.runAsync(
      'UPDATE sets SET weight = ?, reps = ?, is_completed = ?, duration = ?, calories = ?, distance = ? WHERE id = ?',
      weight,
      reps,
      is_completed,
      duration,
      calories,
      distance,
      id
    );
  },

  async deleteSet(id: number): Promise<void> {
    await db.runAsync('DELETE FROM sets WHERE id = ?', id);
  },

  async getSetsForExercise(exercise_id: number): Promise<DatabaseSet[]> {
    return await db.getAllAsync<DatabaseSet>('SELECT * FROM sets WHERE exercise_id = ?', exercise_id);
  },

  async getFullWorkout(workoutId: number) {
    const exercises = await this.getExercisesForWorkout(workoutId);

    const fullExercises = await Promise.all(
      exercises.map(async (ex) => {
        const sets = await this.getSetsForExercise(ex.id!);
        return { ...ex, sets };
      })
    );

    return fullExercises;
  },

  async deleteExercise(id: number): Promise<void> {
    await db.runAsync('DELETE FROM exercises WHERE id = ?', id);
  },


  async getPreviousPerformance(exerciseName: string, currentWorkoutId: number) {
    const lastExercise = await db.getFirstAsync<{ id: number }>(
      `SELECT e.id FROM exercises e 
     JOIN workouts w ON e.workout_id = w.id 
     WHERE e.name = ? AND e.workout_id < ? 
     ORDER BY w.date DESC LIMIT 1`,
      [exerciseName, currentWorkoutId]
    );

    if (!lastExercise) return null;

    return await this.getSetsForExercise(lastExercise.id);
  },

  async getWorkoutHistory() {
    return await db.getAllAsync<{
      id: number;
      title: string;
      date: string;
      exercise_count: number;
      total_volume: number;
    }>(`
      SELECT 
        w.id, 
        w.title, 
        w.date, 
        IFNULL(w.duration, 0) as duration,
        (SELECT COUNT(*) FROM exercises e WHERE e.workout_id = w.id) as exercise_count,
        (SELECT IFNULL(SUM(s.weight * s.reps), 0) FROM sets s JOIN exercises e ON s.exercise_id = e.id WHERE e.workout_id = w.id AND s.is_completed = 1) as total_volume
      FROM workouts w
      WHERE w.is_completed = 1
      ORDER BY w.date DESC
    `);
  },

  async getWeeklyStats() {
    return await db.getFirstAsync<{ workouts: number; volume: number }>(`
      SELECT 
        COUNT(*) as workouts,
        IFNULL((SELECT SUM(s.weight * s.reps) FROM sets s JOIN exercises e ON s.exercise_id = e.id JOIN workouts w2 ON e.workout_id = w2.id WHERE w2.date >= date('now', 'weekday 0', '-7 days') AND s.is_completed = 1), 0) as volume
      FROM workouts 
      WHERE date >= date('now', 'weekday 0', '-7 days') AND is_completed = 1
    `);
  },

  async getMonthAttendance() {
    const results = await db.getAllAsync<{ date: string }>(`
      SELECT date(date) as date FROM workouts 
      WHERE date >= date('now', 'start of month') AND is_completed = 1
    `);
    return results.map(r => new Date(r.date).getDate());
  },

  async getLatestWorkout() {
    return await db.getFirstAsync<any>(`
      SELECT 
        w.id, w.title, w.date, IFNULL(w.duration, 0) as duration,
        (SELECT COUNT(*) FROM exercises e WHERE e.workout_id = w.id) as exercise_count,
        (SELECT IFNULL(SUM(s.weight * s.reps), 0) FROM sets s JOIN exercises e ON s.exercise_id = e.id WHERE e.workout_id = w.id AND s.is_completed = 1) as total_volume
      FROM workouts w
      WHERE w.is_completed = 1
      ORDER BY w.date DESC LIMIT 1
    `);
  },

  async getWorkoutDataOnly() {
    const workouts = await db.getAllAsync<DatabaseWorkout>('SELECT * FROM workouts');
    const exercises = await db.getAllAsync<DatabaseExercise>('SELECT * FROM exercises');
    const sets = await db.getAllAsync<DatabaseSet>('SELECT * FROM sets');

    return {
      workouts,
      exercises,
      sets,
    };
  },

  async restoreFromBackup(data: {
    workouts: DatabaseWorkout[];
    exercises: DatabaseExercise[];
    sets: DatabaseSet[];
  }) {
    try {
      await db.execAsync('BEGIN TRANSACTION');

      await db.runAsync('DELETE FROM sets');
      await db.runAsync('DELETE FROM exercises');
      await db.runAsync('DELETE FROM workouts');

      for (const w of data.workouts) {
        await db.runAsync(
          'INSERT INTO workouts (id, title, date, is_completed, duration) VALUES (?, ?, ?, ?, ?)',
          w.id ?? null,
          w.title,
          w.date ?? null,
          (w as any).is_completed ?? 0,
          w.duration ?? 0
        );
      }

      for (const e of data.exercises) {
        await db.runAsync(
          'INSERT INTO exercises (id, workout_id, name) VALUES (?, ?, ?)',
          e.id ?? null,
          e.workout_id,
          e.name
        );
      }

      for (const s of data.sets) {
        await db.runAsync(
          'INSERT INTO sets (id, exercise_id, weight, reps, duration, calories, distance, is_completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          s.id ?? null,
          s.exercise_id,
          s.weight,
          s.reps,
          s.duration ?? 0,
          s.calories ?? 0,
          s.distance ?? 0,
          s.is_completed ?? 0
        );
      }

      await db.execAsync('COMMIT');
    } catch (error) {
      await db.execAsync('ROLLBACK');
      console.error('Restore failed:', error);
      throw error;
    }
  }

};
