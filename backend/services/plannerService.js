const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const MODE_TEMPLATES = {
  'fat-loss': [
    {
      focus: 'HIIT + Core',
      estimatedMinutes: 35,
      exercises: [
        { name: 'Jump Squats', sets: 4, reps: '12', imageUrl: '' },
        { name: 'Mountain Climbers', sets: 4, reps: '30 sec', imageUrl: '' },
        { name: 'Plank', sets: 3, reps: '45 sec', imageUrl: '' },
      ],
    },
    {
      focus: 'Upper Body Burn',
      estimatedMinutes: 40,
      exercises: [
        { name: 'Push-ups', sets: 4, reps: '10-15', imageUrl: '' },
        { name: 'Dumbbell Rows', sets: 4, reps: '12', imageUrl: '' },
        { name: 'Shoulder Taps', sets: 3, reps: '20', imageUrl: '' },
      ],
    },
    {
      focus: 'Cardio Intervals',
      estimatedMinutes: 30,
      exercises: [
        { name: 'Fast Jog', durationMinutes: 20, imageUrl: '' },
        { name: 'Burpees', sets: 3, reps: '12', imageUrl: '' },
      ],
    },
    {
      focus: 'Lower Body + Mobility',
      estimatedMinutes: 45,
      exercises: [
        { name: 'Walking Lunges', sets: 4, reps: '12 each side', imageUrl: '' },
        { name: 'Glute Bridges', sets: 4, reps: '15', imageUrl: '' },
        { name: 'Hip Openers', durationMinutes: 10, imageUrl: '' },
      ],
    },
    {
      focus: 'Active Recovery',
      estimatedMinutes: 25,
      exercises: [
        { name: 'Brisk Walk', durationMinutes: 20, imageUrl: '' },
        { name: 'Stretching Flow', durationMinutes: 10, imageUrl: '' },
      ],
    },
    {
      focus: 'Full Body Circuit',
      estimatedMinutes: 40,
      exercises: [
        { name: 'Squat to Press', sets: 4, reps: '12', imageUrl: '' },
        { name: 'High Knees', sets: 4, reps: '30 sec', imageUrl: '' },
        { name: 'Russian Twists', sets: 3, reps: '20', imageUrl: '' },
      ],
    },
    {
      focus: 'Recovery Day',
      estimatedMinutes: 20,
      exercises: [{ name: 'Light Walk + Stretch', durationMinutes: 20, imageUrl: '' }],
    },
  ],
  'muscle-gain': [
    {
      focus: 'Push Day (Chest/Shoulders/Triceps)',
      estimatedMinutes: 55,
      exercises: [
        { name: 'Bench Press', sets: 4, reps: '6-10', imageUrl: '' },
        { name: 'Overhead Press', sets: 4, reps: '8-10', imageUrl: '' },
        { name: 'Triceps Dips', sets: 3, reps: '10-12', imageUrl: '' },
      ],
    },
    {
      focus: 'Pull Day (Back/Biceps)',
      estimatedMinutes: 55,
      exercises: [
        { name: 'Lat Pulldown', sets: 4, reps: '8-12', imageUrl: '' },
        { name: 'Seated Cable Row', sets: 4, reps: '8-12', imageUrl: '' },
        { name: 'Biceps Curls', sets: 3, reps: '10-12', imageUrl: '' },
      ],
    },
    {
      focus: 'Leg Day',
      estimatedMinutes: 60,
      exercises: [
        { name: 'Back Squat', sets: 5, reps: '5-8', imageUrl: '' },
        { name: 'Romanian Deadlift', sets: 4, reps: '8-10', imageUrl: '' },
        { name: 'Leg Press', sets: 4, reps: '10-12', imageUrl: '' },
      ],
    },
    {
      focus: 'Upper Volume Day',
      estimatedMinutes: 50,
      exercises: [
        { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', imageUrl: '' },
        { name: 'Single-arm Row', sets: 4, reps: '10 each', imageUrl: '' },
        { name: 'Lateral Raises', sets: 4, reps: '12-15', imageUrl: '' },
      ],
    },
    {
      focus: 'Lower Volume Day',
      estimatedMinutes: 50,
      exercises: [
        { name: 'Front Squat', sets: 4, reps: '8-10', imageUrl: '' },
        { name: 'Walking Lunges', sets: 4, reps: '12 each', imageUrl: '' },
        { name: 'Calf Raises', sets: 4, reps: '15-20', imageUrl: '' },
      ],
    },
    {
      focus: 'Core + Conditioning',
      estimatedMinutes: 30,
      exercises: [
        { name: 'Hanging Knee Raises', sets: 4, reps: '12', imageUrl: '' },
        { name: 'Plank Variations', sets: 3, reps: '60 sec', imageUrl: '' },
        { name: 'Bike Intervals', durationMinutes: 15, imageUrl: '' },
      ],
    },
    {
      focus: 'Recovery Day',
      estimatedMinutes: 20,
      exercises: [{ name: 'Mobility Routine', durationMinutes: 20, imageUrl: '' }],
    },
  ],
  maintenance: [
    {
      focus: 'Full Body Strength',
      estimatedMinutes: 45,
      exercises: [
        { name: 'Goblet Squat', sets: 4, reps: '10', imageUrl: '' },
        { name: 'Push-ups', sets: 4, reps: '12', imageUrl: '' },
        { name: 'One-arm Row', sets: 4, reps: '10 each', imageUrl: '' },
      ],
    },
    {
      focus: 'Cardio + Core',
      estimatedMinutes: 35,
      exercises: [
        { name: 'Jogging', durationMinutes: 20, imageUrl: '' },
        { name: 'Plank', sets: 3, reps: '45 sec', imageUrl: '' },
        { name: 'Dead Bug', sets: 3, reps: '12 each', imageUrl: '' },
      ],
    },
    {
      focus: 'Lower Body',
      estimatedMinutes: 45,
      exercises: [
        { name: 'Split Squat', sets: 4, reps: '10 each', imageUrl: '' },
        { name: 'Hip Thrust', sets: 4, reps: '12', imageUrl: '' },
        { name: 'Calf Raises', sets: 3, reps: '15', imageUrl: '' },
      ],
    },
    {
      focus: 'Upper Body',
      estimatedMinutes: 45,
      exercises: [
        { name: 'Dumbbell Bench Press', sets: 4, reps: '10', imageUrl: '' },
        { name: 'Seated Row', sets: 4, reps: '10', imageUrl: '' },
        { name: 'Shoulder Press', sets: 3, reps: '12', imageUrl: '' },
      ],
    },
    {
      focus: 'Mobility + Walk',
      estimatedMinutes: 30,
      exercises: [
        { name: 'Mobility Flow', durationMinutes: 15, imageUrl: '' },
        { name: 'Brisk Walk', durationMinutes: 20, imageUrl: '' },
      ],
    },
    {
      focus: 'Mixed Circuit',
      estimatedMinutes: 35,
      exercises: [
        { name: 'Kettlebell Swings', sets: 4, reps: '15', imageUrl: '' },
        { name: 'Step-ups', sets: 4, reps: '12 each', imageUrl: '' },
        { name: 'Bicycle Crunch', sets: 3, reps: '20', imageUrl: '' },
      ],
    },
    {
      focus: 'Recovery Day',
      estimatedMinutes: 20,
      exercises: [{ name: 'Stretching Routine', durationMinutes: 20, imageUrl: '' }],
    },
  ],
};

const withImageFallback = (exercise) => ({
  ...exercise,
  imageUrl: exercise.imageUrl && String(exercise.imageUrl).trim() !== ''
    ? exercise.imageUrl
    : FALLBACK_IMAGE_URL,
});

const buildWeekPlanDays = (mode) => {
  const normalizedMode = MODE_TEMPLATES[mode] ? mode : 'maintenance';
  const template = MODE_TEMPLATES[normalizedMode];

  return template.map((day, dayIndex) => ({
    dayIndex,
    dayName: DAY_NAMES[dayIndex],
    focus: day.focus,
    estimatedMinutes: day.estimatedMinutes,
    exercises: day.exercises.map(withImageFallback),
  }));
};

module.exports = {
  FALLBACK_IMAGE_URL,
  buildWeekPlanDays,
};
