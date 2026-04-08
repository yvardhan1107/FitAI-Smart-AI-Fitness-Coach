import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/authStore';
import { ApiRequestError, requestJson } from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const initialNutritionForm = {
  mealType: 'mixed',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  notes: '',
};

const toStartOfDay = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const isSameDay = (dateA, dateB) => toStartOfDay(dateA).getTime() === toStartOfDay(dateB).getTime();

const TodayPage = () => {
  const { token } = useAuth();

  const [todayWorkout, setTodayWorkout] = useState(null);
  const [todayProgress, setTodayProgress] = useState(null);
  const [fallbackImageUrl, setFallbackImageUrl] = useState('');
  const [isPlanMissing, setIsPlanMissing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [todayNutrition, setTodayNutrition] = useState(null);
  const [nutritionForm, setNutritionForm] = useState(initialNutritionForm);
  const [nutritionMessage, setNutritionMessage] = useState('');
  const [nutritionError, setNutritionError] = useState('');
  const [isSavingNutrition, setIsSavingNutrition] = useState(false);
  const [showNutritionForm, setShowNutritionForm] = useState(false);

  const todayDateLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
    []
  );

  const loadTodayNutrition = async () => {
    const data = await requestJson(`${API_BASE_URL}/nutrition?limit=7`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const logs = Array.isArray(data.nutrition) ? data.nutrition : [];
    const today = new Date();
    setTodayNutrition(logs.find((log) => log?.loggedDate && isSameDay(log.loggedDate, today)) || null);
  };

  const loadCompletionState = async () => {
    const data = await requestJson(`${API_BASE_URL}/progress?limit=7`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const logs = Array.isArray(data.progress) ? data.progress : [];
    const today = new Date();
    const todayLog = logs.find((log) => log?.loggedDate && isSameDay(log.loggedDate, today)) || null;
    setTodayProgress(todayLog);
    setIsCompletedToday(Boolean(todayLog?.workoutDone));
  };

  const loadTodayWorkout = async () => {
    setIsLoading(true);
    setError('');
    try {
      const todayData = await requestJson(`${API_BASE_URL}/planner/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayWorkout(todayData.today || null);
      setFallbackImageUrl(todayData.fallbackImageUrl || '');
      setIsPlanMissing(false);
      await Promise.all([loadCompletionState(), loadTodayNutrition()]);
    } catch (loadError) {
      if (loadError instanceof ApiRequestError && loadError.status === 404) {
        setTodayWorkout(null);
        setIsPlanMissing(true);
        setFallbackImageUrl('');
        await Promise.all([loadCompletionState(), loadTodayNutrition()]);
        setIsLoading(false);
        return;
      }
      setError(loadError.message || 'Unable to load today workout');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayWorkout();
  }, []);

  const handleGenerateWeeklyPlan = async () => {
    setIsGenerating(true);
    setError('');
    setSuccessMessage('');
    try {
      const data = await requestJson(`${API_BASE_URL}/planner/generate-weekly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccessMessage(data.message || 'Weekly plan generated.');
      await loadTodayWorkout();
    } catch (generateError) {
      setError(generateError.message || 'Unable to generate weekly plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!todayWorkout) return;
    setIsCompleting(true);
    setError('');
    setSuccessMessage('');
    try {
      const exerciseNames = Array.isArray(todayWorkout.exercises)
        ? todayWorkout.exercises.map((e) => e.name).filter(Boolean)
        : [];
      await requestJson(`${API_BASE_URL}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          workoutDone: true,
          workoutType: todayWorkout.focus || 'Planned workout',
          notes: exerciseNames.length
            ? `Completed from Today page: ${exerciseNames.join(', ')}`
            : 'Completed from Today page',
        }),
      });
      setIsCompletedToday(true);
      setSuccessMessage('Great job! Today\'s workout logged as completed. 🎉');
    } catch (completeError) {
      setError(completeError.message || 'Unable to mark workout complete');
    } finally {
      setIsCompleting(false);
    }
  };

  const estimatedEndTime = useMemo(() => {
    if (!todayWorkout?.estimatedMinutes) return null;
    const finish = new Date(Date.now() + todayWorkout.estimatedMinutes * 60 * 1000);
    return finish.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [todayWorkout]);

  const todayNutritionSummary = useMemo(() => {
    const calories = typeof todayNutrition?.calories === 'number' ? todayNutrition.calories : 0;
    const protein = typeof todayNutrition?.protein === 'number' ? todayNutrition.protein : 0;
    const carbs = typeof todayNutrition?.carbs === 'number' ? todayNutrition.carbs : 0;
    const fats = typeof todayNutrition?.fats === 'number' ? todayNutrition.fats : 0;
    return { calories, protein, carbs, fats, totalMacros: protein + carbs + fats };
  }, [todayNutrition]);

  const handleNutritionChange = (event) => {
    const { name, value } = event.target;
    setNutritionForm((prev) => ({ ...prev, [name]: value }));
    setNutritionError('');
    setNutritionMessage('');
  };

  const handleNutritionSubmit = async (event) => {
    event.preventDefault();
    setNutritionError('');
    setNutritionMessage('');
    for (const field of ['calories', 'protein', 'carbs', 'fats']) {
      if (nutritionForm[field] !== '' && Number(nutritionForm[field]) < 0) {
        setNutritionError(`${field} cannot be negative`);
        return;
      }
    }
    setIsSavingNutrition(true);
    try {
      const data = await requestJson(`${API_BASE_URL}/nutrition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nutritionForm),
      });
      setNutritionMessage(data.message || 'Nutrition saved');
      setNutritionForm(initialNutritionForm);
      setShowNutritionForm(false);
      await loadTodayNutrition();
    } catch (saveError) {
      setNutritionError(saveError.message || 'Unable to save nutrition');
    } finally {
      setIsSavingNutrition(false);
    }
  };

  return (
    <AppLayout title="Today Workout" subtitle={`${todayDateLabel} — your daily plan at a glance.`}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <p className="text-sm text-emerald-300">{successMessage}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
            <div className="skeleton h-40 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Today stats strip */}
            <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {[
                { label: 'Burned', value: `${todayProgress?.burnedCalories ?? 0}`, unit: 'kcal', emoji: '🔥' },
                { label: 'Sleep', value: `${todayProgress?.sleepHours ?? 0}`, unit: 'hrs', emoji: '😴' },
                { label: 'Hydration', value: `${todayProgress?.waterLiters ?? 0}`, unit: 'L', emoji: '💧' },
                { label: 'Calories in', value: `${todayNutritionSummary.calories}`, unit: 'kcal', emoji: '🍽️' },
                { label: 'Macros', value: `${todayNutritionSummary.totalMacros}`, unit: 'g', emoji: '🥩' },
              ].map((stat, i) => (
                <article
                  key={stat.label}
                  className="glass p-4 animate-fade-in-up animate-on-mount"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{stat.label}</p>
                    <span>{stat.emoji}</span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    {stat.value} <span className="text-xs text-neutral-500 font-normal">{stat.unit}</span>
                  </p>
                </article>
              ))}
            </section>

            {/* No plan state */}
            {isPlanMissing && (
              <section className="glass p-8 text-center">
                <span className="text-4xl">📋</span>
                <h2 className="mt-4 text-xl font-bold text-white">No plan yet</h2>
                <p className="mt-2 text-sm text-neutral-400 max-w-md mx-auto">
                  Generate your weekly plan first, then this page will show only today's exercises.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateWeeklyPlan}
                  disabled={isGenerating}
                  className="btn-primary mt-6"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    'Generate weekly plan'
                  )}
                </button>
              </section>
            )}

            {/* Workout focus card */}
            {todayWorkout && (
              <section className="space-y-6">
                <article className="relative overflow-hidden rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-emerald-900/15 via-neutral-900/60 to-cyan-900/10 p-6">
                  <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-[60px]" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Today's Focus</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">{todayWorkout.focus}</h2>
                      <div className="flex items-center gap-3 mt-2 text-sm text-neutral-400">
                        <span>⏱️ {todayWorkout.estimatedMinutes || 0} min</span>
                        {estimatedEndTime && <span>· Finish by {estimatedEndTime}</span>}
                        <span>· {(todayWorkout.exercises || []).length} exercises</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkComplete}
                      disabled={isCompleting || isCompletedToday}
                      className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 flex-shrink-0 ${
                        isCompletedToday
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 cursor-default'
                          : 'btn-primary'
                      }`}
                    >
                      {isCompletedToday ? '✓ Completed' : isCompleting ? 'Saving...' : '✓ Mark completed'}
                    </button>
                  </div>
                </article>

                {/* Exercise cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {(todayWorkout.exercises || []).map((exercise, index) => (
                    <article
                      key={`${exercise.name}-${index}`}
                      className="glass overflow-hidden glass-hover animate-fade-in-up animate-on-mount"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="relative h-44 bg-neutral-800">
                        <img
                          src={exercise.imageUrl || fallbackImageUrl}
                          alt={exercise.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(event) => {
                            if (fallbackImageUrl && event.currentTarget.src !== fallbackImageUrl) {
                              event.currentTarget.src = fallbackImageUrl;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4">
                          <h3 className="text-base font-bold text-white drop-shadow-lg">{exercise.name}</h3>
                        </div>
                      </div>
                      <div className="p-4 flex items-center gap-2 flex-wrap">
                        {exercise.sets && (
                          <span className="badge badge-emerald">{exercise.sets} sets</span>
                        )}
                        {exercise.reps && (
                          <span className="badge badge-cyan">{exercise.reps}</span>
                        )}
                        {exercise.durationMinutes && (
                          <span className="badge badge-amber">{exercise.durationMinutes} min</span>
                        )}
                        {!exercise.sets && !exercise.reps && !exercise.durationMinutes && (
                          <span className="badge badge-neutral">Custom effort</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Nutrition section */}
            <section className="glass p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Today Nutrition</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    {todayNutrition
                      ? `Latest: ${todayNutrition.calories ?? 0} kcal · P ${todayNutrition.protein ?? 0}g · C ${todayNutrition.carbs ?? 0}g · F ${todayNutrition.fats ?? 0}g`
                      : 'No nutrition logged today yet'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNutritionForm(!showNutritionForm)}
                  className={showNutritionForm ? 'btn-ghost' : 'btn-secondary'}
                >
                  {showNutritionForm ? 'Cancel' : '+ Log food'}
                </button>
              </div>

              {nutritionError && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4">
                  <p className="text-sm text-red-300">{nutritionError}</p>
                </div>
              )}
              {nutritionMessage && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 mb-4">
                  <p className="text-sm text-emerald-300">✓ {nutritionMessage}</p>
                </div>
              )}

              {showNutritionForm && (
                <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up" onSubmit={handleNutritionSubmit}>
                  <select
                    name="mealType"
                    value={nutritionForm.mealType}
                    onChange={handleNutritionChange}
                    className="select-field"
                  >
                    <option value="mixed">🍽️ Mixed</option>
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">☀️ Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snack">🍎 Snack</option>
                  </select>

                  <input type="number" min="0" name="calories" value={nutritionForm.calories} onChange={handleNutritionChange} placeholder="Calories" className="input-field" />
                  <input type="number" min="0" name="protein" value={nutritionForm.protein} onChange={handleNutritionChange} placeholder="Protein (g)" className="input-field" />
                  <input type="number" min="0" name="carbs" value={nutritionForm.carbs} onChange={handleNutritionChange} placeholder="Carbs (g)" className="input-field" />
                  <input type="number" min="0" name="fats" value={nutritionForm.fats} onChange={handleNutritionChange} placeholder="Fats (g)" className="input-field" />

                  <button type="submit" disabled={isSavingNutrition} className="btn-primary">
                    {isSavingNutrition ? 'Saving...' : 'Save food'}
                  </button>

                  <textarea
                    name="notes"
                    rows={2}
                    value={nutritionForm.notes}
                    onChange={handleNutritionChange}
                    placeholder="Meal notes (optional)"
                    className="input-field resize-none sm:col-span-2 lg:col-span-3"
                  />
                </form>
              )}

              {/* Macro bar if we have data */}
              {todayNutritionSummary.totalMacros > 0 && !showNutritionForm && (
                <div className="mt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-neutral-800 overflow-hidden flex">
                      <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${(todayNutritionSummary.protein / todayNutritionSummary.totalMacros) * 100}%` }} />
                      <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${(todayNutritionSummary.carbs / todayNutritionSummary.totalMacros) * 100}%` }} />
                      <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(todayNutritionSummary.fats / todayNutritionSummary.totalMacros) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Protein {todayNutritionSummary.protein}g</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" />Carbs {todayNutritionSummary.carbs}g</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Fats {todayNutritionSummary.fats}g</span>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default TodayPage;
