export interface Exercise {
  name: string;
  category: string;
}

export const EXERCISE_CATEGORIES = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'
];

export const ALL_EXERCISES: Exercise[] = [
  // CHEST
  { name: 'Bench Press (Barbell)', category: 'Chest' },
  { name: 'Incline Bench Press (Barbell)', category: 'Chest' },
  { name: 'Dumbbell Bench Press', category: 'Chest' },
  { name: 'Chest Fly (Dumbbell)', category: 'Chest' },
  { name: 'Push Ups', category: 'Chest' },
  { name: 'Cable Crossover', category: 'Chest' },
  
  // BACK
  { name: 'Deadlift (Barbell)', category: 'Back' },
  { name: 'Pull-ups', category: 'Back' },
  { name: 'Lat Pulldown (Wide Grip)', category: 'Back' },
  { name: 'Lat Pulldown (Close Grip)', category: 'Back' },
  { name: 'Bent Over Row (Barbell)', category: 'Back' },
  { name: 'Dumbbell Row (Single Arm)', category: 'Back' },
  { name: 'Seated Cable Row', category: 'Back' },
  { name: 'Reverse Pec Deck', category: 'Back' },
  { name: 'Single Arm Cable Row', category: 'Back' },
  { name: 'Single-Arm Kneeling Cable Pulldown', category: 'Back' },

  // SHOULDERS
  { name: 'Overhead Press (Barbell)', category: 'Shoulders' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders' },
  { name: 'Lateral Raise (Dumbbell)', category: 'Shoulders' },
  { name: 'Front Raise (Dumbbell)', category: 'Shoulders' },
  { name: 'Face Pull', category: 'Shoulders' },

  // LEGS
  { name: 'Back Squat (Barbell)', category: 'Legs' },
  { name: 'Leg Press', category: 'Legs' },
  { name: 'Romanian Deadlift (Barbell)', category: 'Legs' },
  { name: 'Leg Extension', category: 'Legs' },
  { name: 'Leg Curl', category: 'Legs' },
  { name: 'Calf Raise', category: 'Legs' },
  { name: 'Lunges', category: 'Legs' },

  // ARMS
  { name: 'Bicep Curl (Barbell)', category: 'Biceps' },
  { name: 'Hammer Curl (Dumbbell)', category: 'Biceps' },
  { name: 'Tricep Pushdown (Cable)', category: 'Triceps' },
  { name: 'Skull Crusher', category: 'Triceps' },
  { name: 'Dips', category: 'Triceps' },

  // ABS
  { name: 'Plank', category: 'Abs' },
  { name: 'Crunches', category: 'Abs' },
  { name: 'Leg Raise', category: 'Abs' },

  // CARDIO
  { name: 'Running (Treadmill)', category: 'Cardio' },
  { name: 'Cycling', category: 'Cardio' },
  { name: 'Rowing Machine', category: 'Cardio' }
];

// Helper function to get flat names for simple search
export const EXERCISE_NAMES = ALL_EXERCISES.map(ex => ex.name);
