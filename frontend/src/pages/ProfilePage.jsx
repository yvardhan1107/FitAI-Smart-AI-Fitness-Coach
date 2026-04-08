import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const MODE_OPTIONS = [
  { value: 'fat-loss', label: 'Fat Loss', emoji: '🔥', desc: 'Reduce body fat while preserving muscle' },
  { value: 'muscle-gain', label: 'Muscle Gain', emoji: '💪', desc: 'Build strength and lean muscle mass' },
  { value: 'maintenance', label: 'Maintenance', emoji: '⚖️', desc: 'Stay fit and maintain current physique' },
];

const initialForm = {
  age: '',
  weight: '',
  height: '',
  goals: '',
  mode: 'maintenance',
};

const validateForm = (form) => {
  const errors = {};
  const age = Number(form.age);
  const weight = Number(form.weight);
  const height = Number(form.height);

  if (!form.age || Number.isNaN(age) || age < 10 || age > 100) {
    errors.age = 'Age must be between 10 and 100';
  }
  if (!form.weight || Number.isNaN(weight) || weight < 20 || weight > 350) {
    errors.weight = 'Weight must be between 20 and 350 kg';
  }
  if (!form.height || Number.isNaN(height) || height < 80 || height > 250) {
    errors.height = 'Height must be between 80 and 250 cm';
  }
  if (!['fat-loss', 'muscle-gain', 'maintenance'].includes(form.mode)) {
    errors.mode = 'Please select a valid mode';
  }
  return errors;
};

const ProfilePage = () => {
  const { token, user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const goalsPreview = useMemo(
    () => form.goals.split(',').map((g) => g.trim()).filter(Boolean),
    [form.goals]
  );

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load profile');
      const profile = data.profile || {};
      setForm({
        age: profile.age ?? '',
        weight: profile.weight ?? '',
        height: profile.height ?? '',
        goals: Array.isArray(profile.goals) ? profile.goals.join(', ') : '',
        mode: profile.mode || 'maintenance',
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccessMessage('');
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleModeSelect = (mode) => {
    setForm((prev) => ({ ...prev, mode }));
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setError('');

    const errors = validateForm(form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: Number(form.age),
          weight: Number(form.weight),
          height: Number(form.height),
          goals: goalsPreview,
          mode: form.mode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save profile');
      setSuccessMessage('Profile saved successfully');
      setFormErrors({});
      await loadProfile();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout title="Profile" subtitle="Keep your fitness profile updated for better plans.">
      {isLoading ? (
        <div className="space-y-4">
          <div className="skeleton h-32 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="skeleton h-20 rounded-2xl" />
            <div className="skeleton h-20 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl">
          {/* Profile header card */}
          <section className="glass p-6 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
              {userInitial}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name || 'Athlete'}</h2>
              <p className="text-sm text-neutral-400 mt-1">{user?.email || ''}</p>
              {form.mode && (
                <span className="badge badge-emerald mt-2 inline-flex">
                  {MODE_OPTIONS.find((m) => m.value === form.mode)?.emoji}{' '}
                  {MODE_OPTIONS.find((m) => m.value === form.mode)?.label}
                </span>
              )}
            </div>
          </section>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode selector cards */}
            <section>
              <h3 className="text-sm font-semibold text-neutral-300 mb-3">Fitness Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MODE_OPTIONS.map((option) => {
                  const selected = form.mode === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleModeSelect(option.value)}
                      className={`rounded-xl p-4 text-left transition-all duration-200 border ${
                        selected
                          ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20'
                          : 'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-800/60 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <p className={`text-sm font-semibold ${selected ? 'text-emerald-300' : 'text-neutral-200'}`}>
                            {option.label}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">{option.desc}</p>
                        </div>
                      </div>
                      {selected && (
                        <span className="mt-2 inline-block text-xs text-emerald-400">✓ Active</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {formErrors.mode && <p className="text-xs text-red-400 mt-2">{formErrors.mode}</p>}
            </section>

            {/* Body metrics */}
            <section className="glass p-6">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">Body Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="profile-age">
                    Age
                  </label>
                  <input
                    id="profile-age"
                    type="number"
                    name="age"
                    min="10"
                    max="100"
                    value={form.age}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="25"
                  />
                  {formErrors.age && <p className="text-xs text-red-400 mt-1">{formErrors.age}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="profile-weight">
                    Weight (kg)
                  </label>
                  <input
                    id="profile-weight"
                    type="number"
                    name="weight"
                    min="20"
                    max="350"
                    step="0.1"
                    value={form.weight}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="75"
                  />
                  {formErrors.weight && <p className="text-xs text-red-400 mt-1">{formErrors.weight}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2" htmlFor="profile-height">
                    Height (cm)
                  </label>
                  <input
                    id="profile-height"
                    type="number"
                    name="height"
                    min="80"
                    max="250"
                    value={form.height}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="175"
                  />
                  {formErrors.height && <p className="text-xs text-red-400 mt-1">{formErrors.height}</p>}
                </div>
              </div>
            </section>

            {/* Goals */}
            <section className="glass p-6">
              <h3 className="text-sm font-semibold text-neutral-300 mb-4">Fitness Goals</h3>
              <input
                type="text"
                name="goals"
                value={form.goals}
                onChange={handleChange}
                placeholder="Lose fat, improve stamina, sleep better"
                className="input-field"
              />
              {goalsPreview.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {goalsPreview.map((goal) => (
                    <span key={goal} className="badge badge-cyan">
                      🎯 {goal}
                    </span>
                  ))}
                </div>
              )}
              {goalsPreview.length === 0 && (
                <p className="text-xs text-neutral-500 mt-2">Type your goals separated by commas</p>
              )}
            </section>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary px-8 py-3"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save profile'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
};

export default ProfilePage;
