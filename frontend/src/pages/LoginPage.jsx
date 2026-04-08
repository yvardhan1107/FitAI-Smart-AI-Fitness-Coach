import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FitAiLogo = () => (
  <svg viewBox="0 0 64 64" className="h-12 w-12" aria-hidden="true">
    <defs>
      <linearGradient id="loginLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#loginLogoGrad)" opacity="0.22" />
    <rect x="9" y="9" width="46" height="46" rx="13" fill="#0a0a0a" stroke="url(#loginLogoGrad)" strokeWidth="2" />
    <path d="M22 40L31 18H37L46 40H40L38 34H30L28 40H22ZM31.7 29.5H36.3L34 23.1L31.7 29.5Z" fill="url(#loginLogoGrad)" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const errors = {};
    if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!form.password || form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
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
      await login(form);
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
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-emerald-500/5 blur-[120px]" />

        <div className="relative z-10 max-w-lg px-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <FitAiLogo />
            <span className="text-2xl font-bold text-white">FitAI</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black leading-tight">
            <span className="text-gradient-hero">Transform</span>{' '}
            <span className="text-white">your fitness journey</span>
          </h2>

          <p className="mt-6 text-neutral-400 text-lg leading-relaxed">
            AI-powered workout plans, nutrition tracking, and real-time coaching — all in one platform.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { emoji: '🏋️', label: 'Smart Plans' },
              { emoji: '🥗', label: 'Nutrition' },
              { emoji: '📈', label: 'Analytics' },
            ].map((item) => (
              <div
                key={item.label}
                className="glass rounded-xl p-4 text-center"
              >
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-xs text-neutral-400 mt-2 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Right form panel */}
      <section className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-[80px] lg:hidden" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <FitAiLogo />
            <span className="text-xl font-bold text-white">FitAI</span>
          </div>

          <div className="glass p-8 sm:p-10">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-neutral-400 mt-2">Sign in to continue your fitness journey.</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="login-email">
                  Email address
                </label>
                <input
                  id="login-email"
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
                <label className="block text-sm font-medium text-neutral-300 mb-2" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="input-field"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                {formErrors.password && <p className="mt-1.5 text-xs text-red-400">{formErrors.password}</p>}
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
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="text-sm text-neutral-400 mt-6 text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
