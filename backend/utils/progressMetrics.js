const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toDayKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const calculateStreakStats = (loggedDates) => {
  const dayKeys = Array.from(
    new Set(
      (loggedDates || [])
        .map(toDayKey)
        .filter((value) => value !== null)
        .sort((a, b) => a - b)
    )
  );

  if (dayKeys.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWorkoutDays: 0,
      lastWorkoutDate: null,
    };
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < dayKeys.length; index += 1) {
    if (dayKeys[index] - dayKeys[index - 1] === ONE_DAY_MS) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  const dayKeySet = new Set(dayKeys);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = today.getTime();
  const yesterdayKey = todayKey - ONE_DAY_MS;

  let streakCursor = null;
  if (dayKeySet.has(todayKey)) {
    streakCursor = todayKey;
  } else if (dayKeySet.has(yesterdayKey)) {
    streakCursor = yesterdayKey;
  }

  let currentStreak = 0;
  while (streakCursor !== null && dayKeySet.has(streakCursor)) {
    currentStreak += 1;
    streakCursor -= ONE_DAY_MS;
  }

  return {
    currentStreak,
    longestStreak,
    totalWorkoutDays: dayKeys.length,
    lastWorkoutDate: new Date(dayKeys[dayKeys.length - 1]).toISOString(),
  };
};

const calculateAverages = (logs) => {
  const burnedValues = (logs || [])
    .map((log) => log?.burnedCalories)
    .filter((value) => typeof value === 'number' && !Number.isNaN(value));

  const sleepValues = (logs || [])
    .map((log) => log?.sleepHours)
    .filter((value) => typeof value === 'number' && !Number.isNaN(value));

  const avgBurned = burnedValues.length
    ? burnedValues.reduce((sum, value) => sum + value, 0) / burnedValues.length
    : 0;

  const avgSleep = sleepValues.length
    ? sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length
    : 0;

  return {
    avgBurned,
    avgSleep,
  };
};

module.exports = {
  calculateStreakStats,
  calculateAverages,
};
