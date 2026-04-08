const { calculateStreakStats, calculateAverages } = require('../../utils/progressMetrics');

describe('progressMetrics', () => {
  describe('calculateStreakStats', () => {
    test('returns zeros for empty logs', () => {
      expect(calculateStreakStats([])).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        totalWorkoutDays: 0,
        lastWorkoutDate: null,
      });
    });

    test('calculates longest streak and total workout days correctly', () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const oneDay = 24 * 60 * 60 * 1000;
      const day1 = new Date(now.getTime() - 6 * oneDay).toISOString();
      const day2 = new Date(now.getTime() - 5 * oneDay).toISOString();
      const day3 = new Date(now.getTime() - 4 * oneDay).toISOString();
      const day4 = new Date(now.getTime() - 2 * oneDay).toISOString();
      const day5 = new Date(now.getTime() - oneDay).toISOString();

      const result = calculateStreakStats([day1, day2, day3, day4, day5]);

      expect(result.longestStreak).toBe(3);
      expect(result.totalWorkoutDays).toBe(5);
      expect(result.currentStreak).toBeGreaterThanOrEqual(2);
      expect(result.lastWorkoutDate).toBeTruthy();
    });
  });

  describe('calculateAverages', () => {
    test('calculates averages from valid numeric values only', () => {
      const logs = [
        { burnedCalories: 400, sleepHours: 7.5 },
        { burnedCalories: 600, sleepHours: 6.5 },
        { burnedCalories: null, sleepHours: undefined },
        { burnedCalories: Number.NaN, sleepHours: Number.NaN },
      ];

      const result = calculateAverages(logs);

      expect(result.avgBurned).toBe(500);
      expect(result.avgSleep).toBe(7);
    });

    test('returns zero averages for empty or invalid data', () => {
      const result = calculateAverages([{ burnedCalories: null, sleepHours: null }]);

      expect(result.avgBurned).toBe(0);
      expect(result.avgSleep).toBe(0);
    });
  });
});
