'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialMsg, setSocialMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      // Success — redirect to pending page
      router.push('/auth/pending');
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: string) {
    setSocialMsg(`${provider} login coming soon.`);
    setTimeout(() => setSocialMsg(''), 3000);
  }

  return (
    <div className="min-h-screen bg-[#9CA3AF] dark:bg-[#0a0a0a] flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-200">
      {/* Toast for social */}
      {socialMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm px-5 py-2.5 rounded-full shadow-lg">
          {socialMsg}
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-[1150px] min-h-[750px] bg-gradient-to-br from-white to-[#FDF8E8] dark:from-[#1e1e1e] dark:to-[#1e1e1e] rounded-[2.5rem] p-2.5 flex flex-col md:flex-row shadow-2xl relative border border-[#FDF8E8]/50 dark:border-gray-800 transition-colors duration-200">

        {/* ── Left Panel ─────────────────────────────────────── */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative z-10">

          {/* Logo */}
          <div className="flex items-center mb-8 px-2">
            <span className="text-xl font-black tracking-tighter text-[#1a1a1a] dark:text-white font-serif">
              QUANT<span className="text-primary hover:text-primary-foreground transition-colors">F</span>
            </span>
          </div>

          {/* Header */}
          <div className="mt-16 md:mt-20 px-2">
            <h1 className="text-3xl md:text-[32px] font-medium text-gray-900 dark:text-white tracking-tight">
              Create an account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Request access — an admin will review your sign-up.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5 px-2 max-w-[380px]">

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl px-5 py-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[13px] text-gray-400 dark:text-gray-500 ml-4">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amélie Laurent"
                required
                className="w-full bg-[#F0EBD8] dark:bg-gray-800 rounded-full px-6 py-3.5 text-sm text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-shadow focus:ring-2 focus:ring-[#F5C842]/50 border border-transparent dark:border-gray-700"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[13px] text-gray-400 dark:text-gray-500 ml-4">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#F0EBD8] dark:bg-gray-800 rounded-full px-6 py-3.5 text-sm text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-500 dark:placeholder:text-gray-500 transition-shadow focus:ring-2 focus:ring-[#F5C842]/50 border border-transparent dark:border-gray-700"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] text-gray-400 dark:text-gray-500 ml-4">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  required
                  minLength={8}
                  className="w-full bg-[#F0EBD8] dark:bg-gray-800 rounded-full pl-6 pr-12 py-3.5 text-sm text-gray-800 dark:text-gray-200 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 tracking-widest transition-shadow focus:ring-2 focus:ring-[#F5C842]/50 border border-transparent dark:border-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5C842] hover:bg-[#EAB308] disabled:opacity-60 text-gray-900 font-medium rounded-full py-3.5 mt-8 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  Submitting…
                </>
              ) : 'Request Access'}
            </button>

            {/* Social Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.5-.8 1.53.05 2.88.7 3.63 1.8-3.14 1.83-2.65 6.08.45 7.36-.75 1.83-1.68 3.01-2.66 3.81zm-4.24-13.8c.25-2.04-1.28-3.95-3.2-4.13-.34 2.18 1.54 4.02 3.2 4.13z" />
                </svg>
                <span className="text-sm font-medium">Apple</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-auto pt-8 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-2">
            <p>
              Have an account?{' '}
              <a href="/auth/signin" className="text-gray-900 dark:text-white underline font-medium ml-1">
                Sign in
              </a>
            </p>
            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">Terms &amp; Conditions</a>
          </div>
        </div>

        {/* ── Right Panel ─────────────────────────────────────── */}
        <div className="hidden md:block flex-[1.2] relative rounded-[2rem] overflow-hidden">
          <img
            src="https://img.freepik.com/free-vector/colorful-background-with-red-blue-speckled-background_125964-1603.jpg"
            alt="Colorful abstract background"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* Close */}
          <button 
            type="button"
            onClick={() => router.back()}
            className="absolute top-6 right-6 bg-white rounded-full p-2.5 shadow-md hover:bg-gray-50 transition-colors z-20"
          >
            <X size={18} className="text-gray-600" />
          </button>

          {/* Text Overlay */}
          <div className="absolute bottom-16 left-12 z-20 max-w-md pr-8">
            <h2 className="text-[40px] leading-[1.1] font-bold text-white tracking-tight mb-3 drop-shadow-md">
              Bring your ideas to life.
            </h2>
            <p className="text-lg text-white/90 drop-shadow-sm font-medium">
              Predict currency movements with our advanced hybrid models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
