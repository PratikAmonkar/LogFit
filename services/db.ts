import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('logfit.db');

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP,
        is_completed INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER,
        name TEXT NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS sets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER,
        weight REAL,
        reps INTEGER,
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        height REAL,
        weight REAL,
        gender TEXT,
        timer_value INTEGER DEFAULT 60,
        weight_unit TEXT DEFAULT 'kg',
        height_unit TEXT DEFAULT 'cm',
        gym_time TEXT,
        gym_days TEXT,
        notifications_enabled INTEGER DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS weight_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight REAL NOT NULL,
        date TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS routines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        days TEXT NOT NULL,
        duration TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS routine_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        routine_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY (routine_id) REFERENCES routines (id) ON DELETE CASCADE
      );

    `);

    // Safe migration for existing users
    try {
      await db.execAsync('ALTER TABLE user_profile ADD COLUMN notifications_enabled INTEGER DEFAULT 1');
    } catch (e) {
      // Column likely already exists
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

export default db;
