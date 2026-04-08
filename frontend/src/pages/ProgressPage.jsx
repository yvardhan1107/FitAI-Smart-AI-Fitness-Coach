import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/authStore';
import { requestJson } from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const initialForm = {
  workoutDone: false,
  workoutType: '',
  burnedCalories: '',
  sleepHours: '',
  waterLiters: '',
  mood: 'normal',
  notes: '',
};

const MOOD_MAP = {
  low: { emoji: '😔', label: 'Low', color: 'badge-amber' },
  normal: { emoji: '😊', label: 'Normal', color: 'badge-cyan' },
  high: { emoji: '🔥', label: 'High', color: 'badge-emerald' },
};

const validateProgressForm = (form) => {
  const errors = {};
  if (form.workoutType.trim().length > 80) errors.workoutType = 'Max 80 characters';
  if (form.burnedCalories !== '') {
    const burned = Number(form.burnedCalories);
    if (Number.isNaN(burned) || burned < 0 || burned > 5000) errors.burnedCalories = '0–5000 range';
  }
  if (form.sleepHours !== '') {
    const sleep = Number(form.sleepHours);
    if (Number.isNaN(sleep) || sleep < 0 || sleep > 15) errors.sleepHours = '0–15 range';
  }
  if (form.waterLiters !== '') {
    const water = Number(form.waterLiters);
    if (Number.isNaN(water) || water < 0 || water > 30) errors.waterLiters = '0–30 range';
  }
  if (!['low', 'normal', 'high'].includes(form.mood)) errors.mood = 'Invalid mood';
  if (form.notes.trim().length > 500) errors.notes = 'Max 500 characters';
  return errors;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

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

const ProgressPage = () => {
  const { token } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalWorkoutDays: 0,
    lastWorkoutDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [showForm, setShowForm] = useState(false);

  const summary = useMemo(() => {
    const burned = logs.map((l) => l.burnedCalories).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    const sleep = logs.map((l) => l.sleepHours).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    return {
      currentStreak: streak.currentStreak || 0,
      workoutCount: streak.totalWorkoutDays || 0,
      avgBurned: burned.length ? burned.reduce((s, v) => s + v, 0) / burned.length : 0,
      avgSleep: sleep.length ? sleep.reduce((s, v) => s + v, 0) / sleep.length : 0,
    };
  }, [logs, streak]);

  const chartData = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(a.loggedDate) - new Date(b.loggedDate))
        .map((log) => ({
          date: formatDate(log.loggedDate),
          calories: log.burnedCalories || 0,
          sleep: log.sleepHours || 0,
        })),
    [logs]
  );

  const loadProgress = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [progressData, streakData] = await Promise.all([
        requestJson(`${API_BASE_URL}/progress?limit=30`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        requestJson(`${API_BASE_URL}/progress/streak`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setLogs(Array.isArray(progressData.progress) ? progressData.progress : []);
      setStreak({
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        totalWorkoutDays: streakData.totalWorkoutDays || 0,
        lastWorkoutDate: streakData.lastWorkoutDate || null,
      });
    } catch (loadError) {
      setError(loadError.message || 'Unable to load progress');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    const nextFormErrors = validateProgressForm(form);
    setFormErrors(nextFormErrors);
    if (Object.keys(nextFormErrors).length > 0) return;

    setIsSaving(true);
    try {
      const data = await requestJson(`${API_BASE_URL}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      setSuccessMessage(data.message || 'Progress saved successfully');
      setFormErrors({});
      setShowForm(false);
      await loadProgress();
    } catch (saveError) {
      setError(saveError.message || 'Unable to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Progress" subtitle="Track your daily stats and keep your fitness streak alive.">
      <div className="space-y-6">
        {/* Stat cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <section className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: 'Current streak', value: `${summary.currentStreak}`, sub: 'days', emoji: '🔥', accent: 'stat-accent-emerald' },
              { label: 'Workout count', value: `${summary.workoutCount}`, sub: 'total', emoji: '💪', accent: 'stat-accent-cyan' },
              { label: 'Avg burned', value: `${summary.avgBurned.toFixed(0)}`, sub: 'kcal', emoji: '⚡', accent: 'stat-accent-amber' },
              { label: 'Avg sleep', value: `${summary.avgSleep.toFixed(1)}`, sub: 'hrs', emoji: '😴', accent: 'stat-accent-violet' },
            ].map((stat, i) => (
              <article
                key={stat.label}
                className={`glass p-5 ${stat.accent} animate-fade-in-up animate-on-mount`}
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="flex items-start justify-between">
                  <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">{stat.label}</p>
                  <span className="text-lg">{stat.emoji}</span>
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{stat.value} <span className="text-sm text-neutral-500 font-normal">{stat.sub}</span></p>
              </article>
            ))}
          </section>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <p className="text-sm text-emerald-300">✓ {successMessage}</p>
          </div>
        )}

        {/* Chart */}
        {!isLoading && chartData.length > 0 && (
          <section className="glass p-5">
            <h3 className="text-sm font-semibold text-neutral-300 mb-4">Calories & Sleep Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="progCalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="progSleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="calories" stroke="#34d399" strokeWidth={2} fill="url(#progCalGrad)" name="Calories" />
                <Area type="monotone" dataKey="sleep" stroke="#a78bfa" strokeWidth={2} fill="url(#progSleepGrad)" name="Sleep (hrs)" />
              </AreaChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Log form toggle */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Daily Log</h2>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className={showForm ? 'btn-ghost' : 'btn-primary'}
          >
            {showForm ? 'Cancel' : '+ Log today'}
          </button>
        </div>

        {/* Log form */}
        {showForm && (
          <section className="glass p-6 animate-fade-in-up">
            <p className="text-xs text-neutral-500 mb-5">Posting again updates today's entry without wiping untouched fields.</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 cursor-pointer hover:bg-neutral-800/40 transition-colors">
                <input
                  type="checkbox"
                  name="workoutDone"
                  checked={form.workoutDone}
                  onChange={handleChange}
                  className="h-4 w-4 accent-emerald-500 rounded"
                />
                <span className="text-sm text-neutral-200">Workout completed today</span>
              </label>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="prog-type">
                  Workout type
                </label>
                <input
                  id="prog-type"
                  type="text"
                  name="workoutType"
                  value={form.workoutType}
                  onChange={handleChange}
                  placeholder="Push day, run, yoga"
                  className="input-field"
                />
                {formErrors.workoutType && <p className="mt-1 text-xs text-red-400">{formErrors.workoutType}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="prog-cal">
                    Burned calories
                  </label>
                  <input id="prog-cal" type="number" name="burnedCalories" min="0" max="5000" value={form.burnedCalories} onChange={handleChange} className="input-field" />
                  {formErrors.burnedCalories && <p className="mt-1 text-xs text-red-400">{formErrors.burnedCalories}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="prog-sleep">
                    Sleep hours
                  </label>
                  <input id="prog-sleep" type="number" name="sleepHours" min="0" max="15" step="0.1" value={form.sleepHours} onChange={handleChange} className="input-field" />
                  {formErrors.sleepHours && <p className="mt-1 text-xs text-red-400">{formErrors.sleepHours}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="prog-water">
                    Water (liters)
                  </label>
                  <input id="prog-water" type="number" name="waterLiters" min="0" max="30" step="0.1" value={form.waterLiters} onChange={handleChange} className="input-field" />
                  {formErrors.waterLiters && <p className="mt-1 text-xs text-red-400">{formErrors.waterLiters}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="prog-mood">
                    Mood
                  </label>
                  <select id="prog-mood" name="mood" value={form.mood} onChange={handleChange} className="select-field">
                    <option value="low">😔 Low</option>
                    <option value="normal">😊 Normal</option>
                    <option value="high">🔥 High</option>
                  </select>
                  {formErrors.mood && <p className="mt-1 text-xs text-red-400">{formErrors.mood}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="prog-notes">
                  Notes
                </label>
                <textarea id="prog-notes" name="notes" rows={3} value={form.notes} onChange={handleChange} placeholder="How did you feel today?" className="input-field resize-none" />
                {formErrors.notes && <p className="mt-1 text-xs text-red-400">{formErrors.notes}</p>}
              </div>

              <button type="submit" disabled={isSaving} className="btn-primary">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save progress'
                )}
              </button>
            </form>
          </section>
        )}

        {/* Recent logs */}
        {!isLoading && (
          <section className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Logs</h2>
              <span className="text-xs text-neutral-500">{logs.length} entries</span>
            </div>

            {logs.length === 0 ? (
              <p className="text-neutral-500 text-sm py-6 text-center">
                No progress logs yet. Click "Log today" above to start tracking.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  const mood = MOOD_MAP[log.mood] || MOOD_MAP.normal;
                  return (
                    <article
                      key={log._id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/50 hover:bg-neutral-800/30 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
                        {log.workoutDone ? '✅' : '😴'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-neutral-200">
                            {formatDate(log.loggedDate)}
                          </p>
                          {log.workoutDone && (
                            <span className="badge badge-emerald text-[10px]">
                              {log.workoutType || 'Workout'}
                            </span>
                          )}
                          <span className={`badge ${mood.color} text-[10px]`}>
                            {mood.emoji} {mood.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-neutral-500">
                          {log.burnedCalories != null && <span>🔥 {log.burnedCalories} kcal</span>}
                          {log.sleepHours != null && <span>😴 {log.sleepHours}h</span>}
                          {log.waterLiters != null && <span>💧 {log.waterLiters}L</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default ProgressPage;
