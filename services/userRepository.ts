import db from './db';

export interface UserProfile {
  id: number;
  height: number;
  weight: number;
  gender: string;
  timer_value: number;
  weight_unit: string;
  height_unit: string;
  gym_time: string;
  gym_days: string; // Store as comma-separated or JSON string
}

export interface WeightEntry {
  id: number;
  weight: number;
  date: string;
}

export const UserRepository = {
  async saveProfile(profile: Partial<UserProfile>): Promise<void> {
    const { height, weight, gender, timer_value, height_unit, weight_unit, gym_time, gym_days } = profile;

    const existing = await this.getProfile();

    if (existing) {
      await db.runAsync(
        `UPDATE user_profile SET 
          height = COALESCE(?, height), 
          weight = COALESCE(?, weight), 
          gender = COALESCE(?, gender), 
          timer_value = COALESCE(?, timer_value), 
          weight_unit = COALESCE(?, weight_unit), 
          height_unit = COALESCE(?, height_unit),
          gym_time = COALESCE(?, gym_time),
          gym_days = COALESCE(?, gym_days)
         WHERE id = 1`,
        height ?? null,
        weight ?? null,
        gender ?? null,
        timer_value ?? null,
        weight_unit ?? null,
        height_unit ?? null,
        gym_time ?? null,
        gym_days ?? null
      );
    } else {
      await db.runAsync(
        'INSERT INTO user_profile (id, height, weight, gender, timer_value, weight_unit, height_unit, gym_time, gym_days) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)',
        height ?? 0,
        weight ?? 0,
        gender ?? 'male',
        timer_value ?? 60,
        weight_unit ?? 'kg',
        height_unit ?? 'cm',
        gym_time ?? null,
        gym_days ?? null
      );
    }

    // If weight is provided, also log it in history
    if (weight !== undefined) {
      await this.addWeightHistory(weight);
    }
  },

  /**
   * Get the user profile.
   */
  async getProfile(): Promise<UserProfile | null> {
    return await db.getFirstAsync<UserProfile>('SELECT * FROM user_profile WHERE id = 1');
  },

  /**
   * Add a weight entry to history.
   */
  async addWeightHistory(weight: number): Promise<void> {
    await db.runAsync('INSERT INTO weight_history (weight) VALUES (?)', weight);
  },

  /**
   * Get all weight history entries.
   */
  async getWeightHistory(): Promise<WeightEntry[]> {
    return await db.getAllAsync<WeightEntry>('SELECT * FROM weight_history ORDER BY date DESC');
  }
};
