import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FitAiLogo = () => (
  <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
    <defs>
      <linearGradient id="regLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#regLogoGrad)" opacity="0.22" />
    <rect x="9" y="9" width="46" height="46" rx="13" fill="#0a0a0a" stroke="url(#regLogoGrad)" strokeWidth="2" />
    <path d="M22 40L31 18H37L46 40H40L38 34H30L28 40H22ZM31.7 29.5H36.3L34 23.1L31.7 29.5Z" fill="url(#regLogoGrad)" />
  </svg>
);

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-400' };
  if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-emerald-400' };
  return { level: 5, label: 'Very strong', color: 'bg-cyan-400' };
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = getPasswordStrength(form.password);

  const validateForm = () => {
    const errors = {};
    const trimmedName = form.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 60) {
      errors.name = 'Name must be between 2 and 60 characters';
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!form.password || form.password.length < 6 || form.password.length > 128) {
      errors.password = 'Password must be between 6 and 128 characters';
    }
    return errors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex">
      {/* Left hero panel */}
      <section className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden items-center justify-center">
        <div className="absolute top-1/3 -left-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute bottom-1/3 right-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />

        <div className="relative z-10 max-w-lg px-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <FitAiLogo />
            <span className="text-2xl font-bold text-white">FitAI</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black leading-tight">
            <span className="text-white">Start your</span>{' '}
            <span className="text-gradient-hero">fitness revolution</span>
          </h2>

          <p className="mt-6 text-neutral-400 text-lg leading-relaxed">
            Join thousands of athletes using AI to optimize their training, recovery, and nutrition.
          </p>

          <div className="mt-10 space-y-3">
            {[
              { emoji: '✅', text: 'Personalized AI workout plans' },
              { emoji: '✅', text: 'Smart nutrition tracking & macros' },
              { emoji: '✅', text: 'Real-time AI coaching advice' },
              { emoji: '✅', text: 'Progress analytics & streaks' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-neutral-300">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute bottom-10 left-10 h-40 w-40 rounded-full bg-cyan-500/5 blur-[80px] lg:hidden" />

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <FitAiLogo />
            <span className="text-xl font-bold text-white">FitAI</span>
          </div>

          <div className="glass p-8 sm:p-10">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-neutral-400 mt-2">Start your AI-powered fitness journey today.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="reg-name">
                  Full name
                </label>
                <input
                  id="reg-name"
                  className="input-field"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                />
                {formErrors.name && <p className="mt-1.5 text-xs text-red-400">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="reg-email">
                  Email address
                </label>
                <input
                  id="reg-email"
                  className="input-field"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                {formErrors.email && <p className="mt-1.5 text-xs text-red-400">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  className="input-field"
                  type="password"
                  name="password"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                {formErrors.password && <p className="mt-1.5 text-xs text-red-400">{formErrors.password}</p>}

                {/* Password strength bar */}
                {form.password && (
                  <div className="mt-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : 'bg-neutral-700/50'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1.5">{passwordStrength.label}</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-3"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="text-sm text-neutral-400 mt-6 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RegisterPage;
