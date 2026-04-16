export type TrackingType = 'strength' | 'cardio' | 'bodyweight' | 'timed' | 'cardio-distance';

export interface Exercise {
  name: string;
  category: string;
  trackingType: TrackingType;
}

export const EXERCISE_CATEGORIES = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio'
];

export const ALL_EXERCISES: Exercise[] = [
  { name: 'Bench Press (Barbell)', category: 'Chest', trackingType: 'strength' },
  { name: 'Bench Press (Dumbbell)', category: 'Chest', trackingType: 'strength' },
  { name: 'Incline Bench Press (Barbell)', category: 'Chest', trackingType: 'strength' },
  { name: 'Incline Bench Press (Dumbbell)', category: 'Chest', trackingType: 'strength' },
  { name: 'Decline Bench Press (Barbell)', category: 'Chest', trackingType: 'strength' },
  { name: 'Decline Bench Press (Dumbbell)', category: 'Chest', trackingType: 'strength' },
  { name: 'Dumbbell Flyes', category: 'Chest', trackingType: 'strength' },
  { name: 'Push Ups', category: 'Chest', trackingType: 'bodyweight' },
  { name: 'Pec Deck Machine', category: 'Chest', trackingType: 'strength' },
  { name: 'Low Cable Flyes', category: 'Chest', trackingType: 'strength' },
  { name: 'High Cable Flyes', category: 'Chest', trackingType: 'strength' },
  { name: 'Cable Crossover', category: 'Chest', trackingType: 'strength' },

  { name: 'Deadlift (Barbell)', category: 'Back', trackingType: 'strength' },
  { name: 'Pull-ups', category: 'Back', trackingType: 'bodyweight' },
  { name: 'Lat Pulldown (Wide Grip)', category: 'Back', trackingType: 'strength' },
  { name: 'Lat Pulldown (Close Grip)', category: 'Back', trackingType: 'strength' },
  { name: 'Bent Over Row (Barbell)', category: 'Back', trackingType: 'strength' },
  { name: 'Dumbbell Row (Single Arm)', category: 'Back', trackingType: 'strength' },
  { name: 'Seated Cable Row', category: 'Back', trackingType: 'strength' },
  { name: 'Reverse Pec Deck', category: 'Back', trackingType: 'strength' },
  { name: 'Single Arm Cable Row', category: 'Back', trackingType: 'strength' },
  { name: 'Single-Arm Kneeling Cable Pulldown', category: 'Back', trackingType: 'strength' },

  { name: 'Overhead Press (Barbell)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Dumbbell Shoulder Press', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Lateral Raise (Dumbbell)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Front Raise (Dumbbell)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Face Pull', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Lateral Raise (Cable)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Front Raise (Cable)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Lateral Raise (Machine)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Shrug (Dumbbell)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Shrug (Barbell)', category: 'Shoulders', trackingType: 'strength' },
  { name: 'Reverse Pec Deck', category: 'Shoulders', trackingType: 'strength' },

  { name: 'Back Squat (Barbell)', category: 'Legs', trackingType: 'strength' },
  { name: 'Leg Press', category: 'Legs', trackingType: 'strength' },
  { name: 'Romanian Deadlift (Barbell)', category: 'Legs', trackingType: 'strength' },
  { name: 'Leg Extension', category: 'Legs', trackingType: 'strength' },
  { name: 'Leg Curl', category: 'Legs', trackingType: 'strength' },
  { name: 'Standing Calf Raise', category: 'Legs', trackingType: 'strength' },
  { name: 'Seated Calf Raise', category: 'Legs', trackingType: 'strength' },
  { name: 'Lunges', category: 'Legs', trackingType: 'strength' },

  { name: 'Bicep Curl (Barbell)', category: 'Biceps', trackingType: 'strength' },
  { name: 'Bicep Curl (Dumbell)', category: 'Biceps', trackingType: 'strength' },
  { name: 'Hammer Curl (Dumbbell)', category: 'Biceps', trackingType: 'strength' },
  { name: 'EZ Bar Curl', category: 'Biceps', trackingType: 'strength' },
  { name: 'Concentration Curl', category: 'Biceps', trackingType: 'strength' },
  { name: 'Preacher Curl', category: 'Biceps', trackingType: 'strength' },
  { name: 'Incline Dumbbell Curl', category: 'Biceps', trackingType: 'strength' },

  { name: 'Wrist Curls', category: 'Forearms', trackingType: 'strength' },
  { name: 'Barbell Wrist Curl', category: 'Forearms', trackingType: 'strength' },
  { name: 'Reverse Barbell Wrist Curl', category: 'Forearms', trackingType: 'strength' },

  { name: 'Close-Grip Bench Press', category: 'Triceps', trackingType: 'strength' },
  { name: 'Dips', category: 'Triceps', trackingType: 'bodyweight' },
  { name: 'Diamond Push-Ups', category: 'Triceps', trackingType: 'bodyweight' },
  { name: 'Dumbbell Overhead Extension', category: 'Triceps', trackingType: 'strength' },
  { name: 'Cable Overhead Extension', category: 'Triceps', trackingType: 'strength' },
  { name: 'Rope Pushdown', category: 'Triceps', trackingType: 'strength' },
  { name: 'Straight Bar Pushdown', category: 'Triceps', trackingType: 'strength' },
  { name: 'Skull Crusher (Inclined)', category: 'Triceps', trackingType: 'strength' },

  { name: 'Plank', category: 'Abs', trackingType: 'timed' },
  { name: 'Hanging Leg Raise', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Ab Rollout', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Crunches', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Cable Crunch', category: 'Abs', trackingType: 'strength' },
  { name: 'Decline Sit-Ups', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Leg Raises', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Reverse Crunch', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Flutter Kicks', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Russian Twists', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Bicycle Crunch', category: 'Abs', trackingType: 'bodyweight' },
  { name: 'Side Plank', category: 'Abs', trackingType: 'timed' },

  { name: 'Running (Treadmill)', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Cycling', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Rowing Machine', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Treadmill Walking', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Treadmill Jogging', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Treadmill Running', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Incline Walking', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Stationary Bike', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Spin Bike', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Elliptical Trainer', category: 'Cardio', trackingType: 'cardio-distance' },
  { name: 'Skipping Rope', category: 'Cardio', trackingType: 'cardio' },
  { name: 'Burpees', category: 'Cardio', trackingType: 'cardio' },
  { name: 'Mountain Climbers', category: 'Cardio', trackingType: 'cardio' },
  { name: 'High Knees', category: 'Cardio', trackingType: 'cardio' },
  { name: 'Battle Rope', category: 'Cardio', trackingType: 'cardio' },




];

export const EXERCISE_NAMES = ALL_EXERCISES.map(ex => ex.name);
