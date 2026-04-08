import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/authStore';
import { requestJson } from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const toStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getPeriodStartDate = (period) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (period === 'monthly' ? 29 : 6));
  return start;
};

const formatShortDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const MACRO_COLORS = ['#34d399', '#22d3ee', '#fbbf24'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-lg px-3 py-2 text-xs shadow-xl border border-neutral-700/50">
      <p className="text-neutral-400 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ label, value, sub, emoji, accentClass, delay }) => (
  <article
    className={`glass glass-hover p-5 ${accentClass} animate-fade-in-up animate-on-mount`}
    style={{ animationDelay: delay }}
  >
    <div className="flex items-start justify-between">
      <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">{label}</p>
      <span className="text-lg">{emoji}</span>
    </div>
    <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
  </article>
);

const DashboardPage = () => {
  const { user, token } = useAuth();

  const [period, setPeriod] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressLogs, setProgressLogs] = useState([]);
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalWorkoutDays: 0,
    habitStreaks: { sleep: 0, hydration: 0, activeDays: 0 },
  });
  const [nutritionLogs, setNutritionLogs] = useState([]);

  const periodStats = useMemo(() => {
    const startDate = getPeriodStartDate(period);
    const scopedLogs = progressLogs.filter(
      (log) => log?.loggedDate && toStartOfDay(log.loggedDate).getTime() >= startDate.getTime()
    );
    const workouts = scopedLogs.filter((log) => log.workoutDone === true);
    const burnedValues = scopedLogs.map((l) => l.burnedCalories).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    const sleepValues = scopedLogs.map((l) => l.sleepHours).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    const avgBurned = burnedValues.length ? burnedValues.reduce((s, v) => s + v, 0) / burnedValues.length : 0;
    const avgSleep = sleepValues.length ? sleepValues.reduce((s, v) => s + v, 0) / sleepValues.length : 0;

    return {
      loggedDays: scopedLogs.length,
      workoutCount: workouts.length,
      avgBurned,
      avgSleep,
      completionRate: scopedLogs.length ? (workouts.length / scopedLogs.length) * 100 : 0,
    };
  }, [period, progressLogs]);

  const chartData = useMemo(() => {
    const startDate = getPeriodStartDate(period);
    return progressLogs
      .filter((log) => log?.loggedDate && toStartOfDay(log.loggedDate).getTime() >= startDate.getTime())
      .sort((a, b) => new Date(a.loggedDate) - new Date(b.loggedDate))
      .map((log) => ({
        date: formatShortDate(log.loggedDate),
        calories: log.burnedCalories || 0,
        sleep: log.sleepHours || 0,
      }));
  }, [period, progressLogs]);

  const nutritionStats = useMemo(() => {
    const latest = nutritionLogs[0] || null;
    const startDate = getPeriodStartDate(period);
    const scoped = nutritionLogs.filter(
      (log) => log?.loggedDate && toStartOfDay(log.loggedDate).getTime() >= startDate.getTime()
    );
    const cals = scoped.map((l) => l.calories).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    const avgCalories = cals.length ? cals.reduce((s, v) => s + v, 0) / cals.length : 0;

    const protein = typeof latest?.protein === 'number' ? latest.protein : 0;
    const carbs = typeof latest?.carbs === 'number' ? latest.carbs : 0;
    const fats = typeof latest?.fats === 'number' ? latest.fats : 0;
    const totalMacros = protein + carbs + fats;

    return {
      todayCalories: typeof latest?.calories === 'number' ? latest.calories : 0,
      todayProtein: protein,
      avgCalories,
      macroSplit: {
        proteinPct: totalMacros ? (protein / totalMacros) * 100 : 0,
        carbsPct: totalMacros ? (carbs / totalMacros) * 100 : 0,
        fatsPct: totalMacros ? (fats / totalMacros) * 100 : 0,
      },
      macroChartData: totalMacros
        ? [
            { name: 'Protein', value: protein },
            { name: 'Carbs', value: carbs },
            { name: 'Fats', value: fats },
          ]
        : [],
      hasData: Boolean(latest),
    };
  }, [nutritionLogs, period]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [progressData, streakData, nutritionData] = await Promise.all([
        requestJson(`${API_BASE_URL}/progress?limit=60`, { headers }),
        requestJson(`${API_BASE_URL}/progress/streak`, { headers }),
        requestJson(`${API_BASE_URL}/nutrition?limit=60`, { headers }),
      ]);
      setProgressLogs(Array.isArray(progressData.progress) ? progressData.progress : []);
      setStreak({
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        totalWorkoutDays: streakData.totalWorkoutDays || 0,
        habitStreaks: {
          sleep: streakData.habitStreaks?.sleep || 0,
          hydration: streakData.habitStreaks?.hydration || 0,
          activeDays: streakData.habitStreaks?.activeDays || 0,
        },
      });
      setNutritionLogs(Array.isArray(nutritionData.nutrition) ? nutritionData.nutrition : []);
    } catch (loadError) {
      setError(loadError.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDashboardData();
    else setIsLoading(false);
  }, [token]);

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome hero */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-900/20 via-neutral-900/60 to-cyan-900/15 p-6 sm:p-8">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-[80px]" />
          <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-cyan-500/5 blur-[60px]" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="pt-6 lg:pt-0">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400/80 font-medium">{todayLabel}</p>
              <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                Welcome back, <span className="text-gradient">{user?.name || 'Athlete'}</span>
              </h1>
              <p className="mt-2 text-sm text-neutral-400">Here's your fitness overview for the {period} period.</p>
            </div>

            <div className="flex items-center gap-2">
              {['weekly', 'monthly'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    period === p
                      ? 'bg-gradient-to-r from-emerald-600/80 to-cyan-600/80 text-white shadow-lg shadow-emerald-500/10'
                      : 'btn-ghost'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Main stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                label="Current streak"
                value={`${streak.currentStreak}`}
                sub={`Longest: ${streak.longestStreak} days`}
                emoji="🔥"
                accentClass="stat-accent-emerald"
                delay="75ms"
              />
              <StatCard
                label={`Workouts (${period})`}
                value={periodStats.workoutCount}
                sub={`From ${periodStats.loggedDays} logged days`}
                emoji="💪"
                accentClass="stat-accent-cyan"
                delay="150ms"
              />
              <StatCard
                label={`Avg burned (${period})`}
                value={`${periodStats.avgBurned.toFixed(0)}`}
                sub="kcal per logged day"
                emoji="⚡"
                accentClass="stat-accent-amber"
                delay="225ms"
              />
              <StatCard
                label={`Avg sleep (${period})`}
                value={`${periodStats.avgSleep.toFixed(1)}h`}
                sub={`Completion ${periodStats.completionRate.toFixed(0)}%`}
                emoji="😴"
                accentClass="stat-accent-violet"
                delay="300ms"
              />
            </section>

            {/* Charts row */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Area chart - burned calories */}
              <article className="lg:col-span-2 glass p-5">
                <h3 className="text-sm font-semibold text-neutral-300 mb-4">Calories Burned Trend</h3>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="burnedGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} />
                      <YAxis axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="#34d399"
                        strokeWidth={2}
                        fill="url(#burnedGrad)"
                        name="Calories"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-neutral-500 text-sm">
                    No calorie data yet for this period
                  </div>
                )}
              </article>

              {/* Macro donut chart */}
              <article className="glass p-5">
                <h3 className="text-sm font-semibold text-neutral-300 mb-4">Macro Split (Latest)</h3>
                {nutritionStats.macroChartData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={nutritionStats.macroChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {nutritionStats.macroChartData.map((entry, index) => (
                            <Cell key={entry.name} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-4 mt-2">
                      {nutritionStats.macroChartData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: MACRO_COLORS[index] }}
                          />
                          <span className="text-xs text-neutral-400">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-neutral-500 text-sm">
                    No nutrition data yet
                  </div>
                )}
              </article>
            </section>

            {/* Nutrition row */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Today calories"
                value={nutritionStats.todayCalories}
                sub={`Avg (${period}): ${nutritionStats.avgCalories.toFixed(0)} kcal`}
                emoji="🍽️"
                accentClass="stat-accent-emerald"
                delay="100ms"
              />
              <StatCard
                label="Today protein"
                value={`${nutritionStats.todayProtein}g`}
                sub="Latest nutrition log"
                emoji="🥩"
                accentClass="stat-accent-cyan"
                delay="175ms"
              />
              <article className="glass p-5 stat-accent-amber animate-fade-in-up animate-on-mount" style={{ animationDelay: '250ms' }}>
                <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Macro split (latest)</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden flex">
                    <div className="h-full bg-emerald-400 transition-all" style={{ width: `${nutritionStats.macroSplit.proteinPct}%` }} />
                    <div className="h-full bg-cyan-400 transition-all" style={{ width: `${nutritionStats.macroSplit.carbsPct}%` }} />
                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${nutritionStats.macroSplit.fatsPct}%` }} />
                  </div>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  P {nutritionStats.macroSplit.proteinPct.toFixed(0)}% · C {nutritionStats.macroSplit.carbsPct.toFixed(0)}% · F {nutritionStats.macroSplit.fatsPct.toFixed(0)}%
                </p>
              </article>
            </section>

            {/* Habit streaks */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Sleep streak"
                value={`${streak.habitStreaks.sleep}`}
                sub="7+ hours sleep days"
                emoji="🌙"
                accentClass="stat-accent-violet"
                delay="100ms"
              />
              <StatCard
                label="Hydration streak"
                value={`${streak.habitStreaks.hydration}`}
                sub="2+ liters water days"
                emoji="💧"
                accentClass="stat-accent-cyan"
                delay="175ms"
              />
              <StatCard
                label="Active-day streak"
                value={`${streak.habitStreaks.activeDays}`}
                sub="Workout completed days"
                emoji="🏃"
                accentClass="stat-accent-emerald"
                delay="250ms"
              />
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
