'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { setCarschekSessionCookies } from '@/lib/auth/session';
import AppLogo from '@/components/ui/AppLogo';
import { Eye, EyeOff, Shield, ArrowLeft, CheckCircle, Mail, Lock, RefreshCw, ChevronRight, AlertTriangle } from 'lucide-react';

type AuthStep = 'login' | '2fa' | 'welcome' | 'forgot-1' | 'forgot-2' | 'forgot-3';

interface LoginForm { email: string; password: string; remember: boolean; }
interface ForgotForm { email: string; }
interface NewPasswordForm { password: string; confirmPassword: string; }

const ROLE_CONFIG = {
  'super-admin': { label: 'Super Admin', color: 'bg-amber-100 text-amber-800 border-amber-300', modules: ['Dashboard', 'Orders', 'Inspectors', 'Reports', 'Customers', 'Listings', 'Deals', 'Finance', 'Settings'] },
  'ops-manager': { label: 'Ops Manager', color: 'bg-blue-100 text-blue-800 border-blue-300', modules: ['Dashboard', 'Orders', 'Inspectors', 'Reports', 'Customers'] },
  'inspector': { label: 'Inspector', color: 'bg-teal-100 text-teal-800 border-teal-300', modules: ['My Jobs', 'Reports', 'Schedule'] },
  'finance': { label: 'Finance', color: 'bg-green-100 text-green-800 border-green-300', modules: ['Finance', 'Deals', 'Reports'] },
  'support': { label: 'Support', color: 'bg-gray-100 text-gray-700 border-gray-300', modules: ['Customers', 'Orders', 'Notifications'] },
};

const DEMO_ACCOUNTS = [
  { role: 'super-admin' as const, email: 'promise@carschek.com', password: 'Carschek@2026', name: 'Promise Ndem' },
  { role: 'ops-manager' as const, email: 'operations@carschek.com', password: 'OpsManager@2026', name: 'Chukwuemeka Obi' },
  { role: 'inspector' as const, email: 'emeka.inspector@carschek.com', password: 'Inspector@2026', name: 'Emeka Okonkwo' },
];

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-amber-400', 'bg-[#1A7A4A]'];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0,1,2,3].map(i => (
          <div key={`strength-bar-${i}`} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score] : 'bg-gray-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 mt-1">
        {checks.map(c => (
          <div key={`check-${c.label}`} className={`flex items-center gap-1 text-[10px] ${c.pass ? 'text-[#1A7A4A]' : 'text-[#6B7280]'}`}>
            <CheckCircle size={10} className={c.pass ? 'text-[#1A7A4A]' : 'text-gray-300'} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function OTPInput({ onComplete }: { onComplete: (code: string) => void }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const d = [...digits];
    d[idx] = val.slice(-1);
    setDigits(d);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
    if (d.every(x => x !== '')) onComplete(d.join(''));
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={`otp-${i}`}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl text-[#1F2937] transition-all focus:outline-none focus:border-[#ff5722] focus:ring-2 focus:ring-[#ff5722]/20 border-[#E5E7EB] bg-white"
        />
      ))}
    </div>
  );
}

function CountdownTimer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const pct = (remaining / seconds) * 100;
  const r = 20;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2">
      <svg width="48" height="48" className="-rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#E5E7EB" strokeWidth="3" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="#ff5722" strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round" className="transition-all duration-1000" />
      </svg>
      <span className="text-sm font-medium text-[#1F2937] font-mono">
        Code expires in {m}:{s.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

export default function AuthenticationScreen() {
  const [step, setStep] = useState<AuthStep>('login');
  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [otpExpired, setOtpExpired] = useState(false);
  const [welcomeRole, setWelcomeRole] = useState<keyof typeof ROLE_CONFIG>('super-admin');
  const [welcomeName, setWelcomeName] = useState('Promise Ndem');
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '', remember: false } });
  const forgotForm = useForm<ForgotForm>();
  const newPassForm = useForm<NewPasswordForm>();
  const newPassword = newPassForm.watch('password', '');

  useEffect(() => {
    if (lockedUntil) {
      const interval = setInterval(() => {
        const rem = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
        setLockCountdown(rem);
        if (rem === 0) { setLockedUntil(null); setFailedAttempts(0); }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockedUntil]);

  const handleLogin = async (data: LoginForm) => {
    if (lockedUntil) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    const match = DEMO_ACCOUNTS.find(a => a.email === data.email && a.password === data.password);
    if (!match) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 15 * 60 * 1000);
        setLockCountdown(900);
      }
      loginForm.setError('password', { message: 'Invalid credentials — use the demo accounts below to sign in' });
      setIsSubmitting(false);
      return;
    }
    setWelcomeRole(match.role);
    setWelcomeName(match.name);
    setIsSubmitting(false);
    setStep('2fa');
  };

  const handle2FA = (code: string) => {
    if (code === '123456' || code.length === 6) {
      toast.success('Identity verified successfully');
      setCarschekSessionCookies(welcomeRole);
      setStep('welcome');
    }
  };

  const handleForgotSubmit = async (data: ForgotForm) => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setForgotEmail(data.email);
    setIsSubmitting(false);
    setStep('forgot-2');
  };

  const handleNewPassword = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setIsSubmitting(false);
    toast.success('Password updated successfully. Please sign in.');
    setStep('login');
  };

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    loginForm.setValue('email', account.email);
    loginForm.setValue('password', account.password);
  };

  const maskEmail = (email: string) => {
    const [user, domain] = email.split('@');
    return `${user[0]}***@${domain}`;
  };

  const remainingAttempts = Math.max(0, 5 - failedAttempts);

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] bg-[#ff5722] flex-col relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#ff8a65] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#ff8a65] rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col h-full p-10">
          <div className="flex items-center">
            <AppLogo size={56} />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Shield size={40} className="text-[#ff8a65]" />
              </div>
              <h1 className="text-3xl xl:text-4xl font-heading font-bold text-white leading-tight mb-4">
                Nigeria&apos;s Trusted Vehicle Inspection Platform
              </h1>
              <p className="text-white/60 text-base leading-relaxed">
                Professional inspections, verified listings, and transparent deal management — all in one platform.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: '🔍', text: 'Professional pre-purchase vehicle inspection' },
                { icon: '📋', text: '27-point Carschek Score methodology' },
                { icon: '🤝', text: 'Escrow-protected vehicle transactions' },
                { icon: '📍', text: 'Lagos, Abuja, Port Harcourt & more' },
              ].map((item, i) => (
                <div key={`feature-${i}`} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-white/70 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-white/30 text-xs">
            © 2026 Carschek Technologies Ltd. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">

          {/* LOGIN */}
          {step === 'login' && (
            <div className="animate-fade-in">
              <div className="lg:hidden mb-8">
                <AppLogo size={48} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-[#1F2937] mb-1">Welcome back</h2>
              <p className="text-[#6B7280] text-sm mb-8">Sign in to your Carschek admin account</p>

              {/* Lock warning */}
              {lockedUntil && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="text-[#C0392B] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#C0392B]">Account temporarily locked</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Too many failed attempts. Try again in {Math.floor(lockCountdown / 60)}:{(lockCountdown % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>
              )}

              {!lockedUntil && failedAttempts > 0 && failedAttempts < 5 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="text-[#D35400] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">{remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before 15-minute lockout</p>
                </div>
              )}

              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type="email"
                      {...loginForm.register('email', { required: 'Email is required' })}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all"
                      placeholder="you@carschek.com"
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-[#C0392B]">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#1F2937]">Password</label>
                    <button type="button" onClick={() => setStep('forgot-1')} className="text-xs text-[#ff8a65] hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      {...loginForm.register('password', { required: 'Password is required' })}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="mt-1 text-xs text-[#C0392B]">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" {...loginForm.register('remember')} className="w-4 h-4 rounded border-[#E5E7EB] text-[#ff5722] focus:ring-[#ff5722]" />
                  <label htmlFor="remember" className="text-xs text-[#6B7280]">Remember me for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !!lockedUntil}
                  className="w-full py-2.5 bg-[#ff5722] hover:bg-[#e64a19] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><RefreshCw size={16} className="animate-spin" />Signing in…</>
                  ) : (
                    <>Sign In <ChevronRight size={16} /></>
                  )}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 p-4 bg-[#F4F6F8] rounded-xl border border-[#E5E7EB]">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-3">Demo Accounts</p>
                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map(acc => (
                    <div key={`demo-${acc.email}`} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#E5E7EB]">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-[#1F2937]">{ROLE_CONFIG[acc.role].label}</p>
                        <p className="text-[10px] text-[#6B7280] font-mono truncate">{acc.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillDemo(acc)}
                        className="text-[10px] font-semibold text-[#ff8a65] hover:text-[#ff5722] px-2 py-1 rounded border border-[#ff8a65]/30 hover:bg-blue-50 transition-colors"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-[#6B7280]">
                Having trouble?{' '}
                <a href="mailto:support@carschek.com" className="text-[#ff8a65] hover:underline">Contact support</a>
              </p>
            </div>
          )}

          {/* 2FA */}
          {step === '2fa' && (
            <div className="animate-fade-in text-center">
              <button onClick={() => setStep('login')} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1F2937] mb-8 transition-colors">
                <ArrowLeft size={14} /> Back to login
              </button>
              <div className="w-14 h-14 bg-[#ff5722]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={28} className="text-[#ff5722]" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-[#1F2937] mb-2">Two-Factor Authentication</h2>
              <p className="text-[#6B7280] text-sm mb-8">Enter the 6-digit code from your authenticator app</p>

              <OTPInput onComplete={handle2FA} />

              <div className="mt-6 flex justify-center">
                {!otpExpired ? (
                  <CountdownTimer seconds={272} onExpire={() => setOtpExpired(true)} />
                ) : (
                  <p className="text-xs text-[#C0392B] font-medium">Code expired</p>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center gap-3">
                <button
                  disabled={!otpExpired}
                  className="text-sm text-[#ff8a65] hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw size={14} /> Resend code
                </button>
                <button className="text-xs text-[#6B7280] hover:text-[#1F2937]">Use backup code instead</button>
              </div>

              <div className="mt-6 p-3 bg-[#F4F6F8] rounded-lg border border-[#E5E7EB]">
                <p className="text-[10px] text-[#6B7280]">For demo: enter any 6 digits to proceed</p>
              </div>
            </div>
          )}

          {/* WELCOME */}
          {step === 'welcome' && (
            <div className="animate-fade-in text-center">
              <div className="mx-auto mb-6 flex justify-center">
                <AppLogo size={64} />
              </div>
              <p className="text-[#6B7280] text-sm mb-1">Welcome back</p>
              <h2 className="text-2xl font-heading font-bold text-[#1F2937] mb-3">{welcomeName}</h2>
              <span className={`inline-flex items-center border text-xs font-semibold px-3 py-1 rounded-full ${ROLE_CONFIG[welcomeRole].color}`}>
                {ROLE_CONFIG[welcomeRole].label}
              </span>
              <p className="text-[#6B7280] text-sm mt-4 mb-6">You have access to the following modules:</p>
              <div className="grid grid-cols-3 gap-2 mb-8">
                {ROLE_CONFIG[welcomeRole].modules.map(mod => (
                  <div key={`mod-${mod}`} className="p-2 bg-[#F4F6F8] rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#1F2937]">
                    {mod}
                  </div>
                ))}
              </div>
              <a
                href="/dashboard"
                className="block w-full py-2.5 bg-[#ff5722] hover:bg-[#e64a19] text-white font-semibold text-sm rounded-lg transition-all duration-150 active:scale-[0.99] text-center"
              >
                Go to Dashboard →
              </a>
            </div>
          )}

          {/* FORGOT 1 */}
          {step === 'forgot-1' && (
            <div className="animate-fade-in">
              <button onClick={() => setStep('login')} className="flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#1F2937] mb-8 transition-colors">
                <ArrowLeft size={14} /> Back to login
              </button>
              <h2 className="text-2xl font-heading font-bold text-[#1F2937] mb-1">Reset your password</h2>
              <p className="text-[#6B7280] text-sm mb-8">Enter your email and we&apos;ll send a reset link</p>
              <form onSubmit={forgotForm.handleSubmit(handleForgotSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Email address</label>
                  <input
                    type="email"
                    {...forgotForm.register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all"
                    placeholder="you@carschek.com"
                  />
                  {forgotForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-[#C0392B]">{forgotForm.formState.errors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#ff5722] hover:bg-[#e64a19] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><RefreshCw size={16} className="animate-spin" />Sending…</> : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}

          {/* FORGOT 2 */}
          {step === 'forgot-2' && (
            <div className="animate-fade-in text-center">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={28} className="text-[#1A7A4A]" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-[#1F2937] mb-2">Check your email</h2>
              <p className="text-[#6B7280] text-sm mb-2">We sent a password reset link to</p>
              <p className="font-mono text-sm font-semibold text-[#1F2937] mb-6">{maskEmail(forgotEmail || 'you@carschek.com')}</p>
              <p className="text-xs text-[#6B7280] mb-6">Didn&apos;t receive it? Check your spam folder or{' '}
                <button onClick={() => setStep('forgot-1')} className="text-[#ff8a65] hover:underline">try again</button>
              </p>
              <button
                onClick={() => setStep('forgot-3')}
                className="w-full py-2.5 bg-[#ff5722] text-white font-semibold text-sm rounded-lg hover:bg-[#e64a19] transition-all"
              >
                I&apos;ve received the link →
              </button>
            </div>
          )}

          {/* FORGOT 3 */}
          {step === 'forgot-3' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-heading font-bold text-[#1F2937] mb-1">Set new password</h2>
              <p className="text-[#6B7280] text-sm mb-8">Choose a strong password for your account</p>
              <form onSubmit={newPassForm.handleSubmit(handleNewPassword)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">New password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      {...newPassForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                      className="w-full pl-4 pr-10 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowNewPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword && <PasswordStrength password={newPassword} />}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2937] mb-1.5">Confirm password</label>
                  <input
                    type="password"
                    {...newPassForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: v => v === newPassword || 'Passwords do not match',
                    })}
                    className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#ff5722]/20 focus:border-[#ff5722] transition-all"
                    placeholder="••••••••"
                  />
                  {newPassForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-xs text-[#C0392B]">{newPassForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#ff5722] hover:bg-[#e64a19] disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <><RefreshCw size={16} className="animate-spin" />Updating…</> : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}