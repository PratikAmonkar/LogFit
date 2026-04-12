import db from './db';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // 1. Clear existing data (Optional - remove if you want to keep your current data)
    await db.execAsync(`
      DELETE FROM workouts;
      DELETE FROM exercises;
      DELETE FROM sets;
    `);

    // Helper to generate ISO strings for different days
    const getDate = (daysAgo: number) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString();
    };

    // 2. Insert Workouts for different time periods
    const workouts = [
      { title: 'Leg Power Session', date: getDate(0), completed: 1 }, // Today
      { title: 'Upper Body Push', date: getDate(2), completed: 1 }, // This Week
      { title: 'Deadlift Focus', date: getDate(5), completed: 1 },  // This Week
      { title: 'Morning Cardio', date: getDate(10), completed: 1 }, // Last Week
      { title: 'Full Body Blast', date: getDate(25), completed: 1 }, // This Month
      { title: 'Endurance Training', date: getDate(40), completed: 1 } // Last Month
    ];

    for (const w of workouts) {
      const result = await db.runAsync(
        'INSERT INTO workouts (title, date, is_completed) VALUES (?, ?, ?)',
        w.title, w.date, w.completed
      );
      const workoutId = result.lastInsertRowId;

      // 3. Add Exercises to each workout
      const exerciseNames = ['Barbell Squat', 'Bench Press', 'Deadlift'];
      for (const exName of exerciseNames) {
        const exResult = await db.runAsync(
          'INSERT INTO exercises (workout_id, name) VALUES (?, ?)',
          workoutId, exName
        );
        const exerciseId = exResult.lastInsertRowId;

        // 4. Add 3 Sets to each exercise
        for (let i = 1; i <= 3; i++) {
          await db.runAsync(
            'INSERT INTO sets (exercise_id, weight, reps, is_completed) VALUES (?, ?, ?, 1)',
            exerciseId,
            Math.floor(Math.random() * 50) + 40, // Random weight 40-90kg
            Math.floor(Math.random() * 5) + 8    // Random reps 8-12
          );
        }
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
};
