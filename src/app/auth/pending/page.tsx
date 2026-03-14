import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-[#9CA3AF] dark:bg-[#0a0a0a] flex items-center justify-center p-4 md:p-8 font-sans transition-colors duration-200">
      <div className="w-full max-w-[480px] bg-gradient-to-br from-white to-[#FDF8E8] dark:from-[#1e1e1e] dark:to-[#1e1e1e] rounded-[2.5rem] p-10 shadow-2xl border border-[#FDF8E8]/50 dark:border-gray-800 flex flex-col items-start transition-colors duration-200">

        {/* Logo */}
        <div className="inline-flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-full px-5 py-1.5 mb-12">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">QuantForecast</span>
        </div>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#F5C842]/20 flex items-center justify-center mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Text */}
        <h1 className="text-2xl md:text-[28px] font-medium text-gray-900 dark:text-white tracking-tight">
          Account under review
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed max-w-[340px]">
          Your account has been created and is awaiting admin approval.
          You&apos;ll receive an email as soon as you&apos;re approved — usually within 24 hours.
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-8" />

        {/* Info block */}
        <div className="bg-[#F0EBD8] dark:bg-gray-800 rounded-2xl px-6 py-4 w-full transition-colors">
          <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
            If you believe this is taking too long, contact{' '}
            <a href="mailto:support@netalgospace.com" className="text-gray-900 dark:text-white underline font-medium">
              support@netalgospace.com
            </a>
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/auth/signin"
          className="mt-8 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white underline transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
