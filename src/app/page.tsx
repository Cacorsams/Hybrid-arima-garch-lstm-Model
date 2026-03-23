"use client";
import React, { useState } from 'react'
import Link from 'next/link'

const teamMembers = [
  {
    name: 'Seth Araka Morisi',
    bio: 'Lead researcher specializing in ARIMA-GARCH integration and statistical validation.',
    image: 'https://i.pravatar.cc/800?u=Seth'
  },
  {
    name: 'Austin Kipsigei',
    bio: 'Expert in quantitative finance and volatility clustering analysis for KES/CAD markets.',
    image: 'https://i.pravatar.cc/800?u=Austin'
  },
  {
    name: 'Moses Kibarbet',
    bio: 'Machine learning lead focused on LSTM architecture optimization and neural network training.',
    image: 'https://i.pravatar.cc/800?u=Moses'
  },
  {
    name: 'Tatiana Oumah',
    bio: 'Data scientist dedicated to high-frequency financial data cleaning and feature engineering.',
    image: 'https://i.pravatar.cc/800?u=Tatiana'
  },
  {
    name: 'Collins Akolo',
    bio: 'Statistical modeler ensuring robustness and significance testing across all hybrid layers.',
    image: 'https://i.pravatar.cc/800?u=Collins'
  },
  {
    name: 'Ziporah Obiero',
    bio: 'Research assistant managing data sourcing from CBK and bibliographic documentation.',
    image: 'https://i.pravatar.cc/800?u=Ziporah'
  },
  {
    name: 'Joseph Kimanzi',
    bio: 'Financial analyst translating model outputs into actionable macroeconomic insights.',
    image: 'https://i.pravatar.cc/800?u=Joseph'
  },
]

export default function ProjectPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (teamMembers.length - 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (teamMembers.length - 3)) % (teamMembers.length - 3));
  };

  return (
    <div
      className="min-h-screen w-full bg-[#f5f0eb] dark:bg-[#121212] transition-colors duration-200"
      style={{
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#f5f0eb]/95 dark:bg-[#121212]/95 backdrop-blur-sm border-b border-[#e0dbd5] dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white tracking-tight"
            style={{
              fontFamily: "'DM Serif Display', serif",
            }}
          >
            QuantForecast®
          </Link>
          <ul className="hidden md:flex items-center gap-8 text-sm text-[#555] dark:text-gray-400">
            <li>
              <Link
                href="/"
                className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/models"
                className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/"
                className="text-[#1a1a1a] dark:text-white underline underline-offset-4 decoration-[1.5px]"
              >
                Project
              </Link>
            </li>
            <li>
              <Link
                href="/system/Dashboard"
                className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <a
                href="/Documentation"
                className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-200"
              >
                Documentation
              </a>
            </li>
          </ul>
          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#1a1a1a] dark:text-white p-2"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e0dbd5] dark:border-gray-800 bg-[#f5f0eb] dark:bg-[#121212] px-6 py-4 animate-in slide-in-from-top-4 duration-200">
            <ul className="flex flex-col gap-4 text-base font-medium text-[#1a1a1a] dark:text-white">
              <li>
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/models" onClick={() => setMobileMenuOpen(false)}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/" className="underline underline-offset-4" onClick={() => setMobileMenuOpen(false)}>
                  Project
                </Link>
              </li>
              <li>
                <Link href="/system/Dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="/Documentation" onClick={() => setMobileMenuOpen(false)}>
                  Documentation
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12 md:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left: Heading + Subtitle */}
          <div className="md:col-span-12 flex flex-col justify-start">
            <h1
              className="text-[40px] sm:text-[56px] md:text-[64px] lg:text-[72px] leading-[1.1] font-normal text-[#1a1a1a] dark:text-white mb-6 md:mb-8"
              style={{
                fontFamily: "'DM Serif Display', serif",
              }}
            >
              A HYBRID GARCH-LSTM-ARIMA MODEL <br className="hidden md:block" /> FOR CURRENCY EXCHANGE RATE FORECASTING
            </h1>
            <p className="text-[#555] dark:text-gray-400 text-base md:text-lg leading-relaxed max-w-4xl">
              A RESEARCH PROPOSAL SUBMITTED TO THE FACULTY OF SCIENCE AND TECHNOLOGY IN PARTIAL FULFILLMENT OF THE REQUIREMENT FOR THE AWARD OF A BACHELOR’S DEGREE IN MATHEMATICS AND COMPUTER SCIENCE, MULTIMEDIA UNIVERSITY OF KENYA (2026)
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Filter Section (Abstract) */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 border-b border-[#e0dbd5] dark:border-gray-800">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 text-sm text-[#555] dark:text-gray-400 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-white inline-block" />
            Research Overview
          </span>
          <h2
            className="text-[36px] sm:text-[48px] md:text-[56px] lg:text-[64px] leading-[1.05] font-normal text-[#1a1a1a] dark:text-white mb-6"
            style={{
              fontFamily: "'DM Serif Display', serif",
            }}
          >
            Project Abstract
          </h2>
          <div className="text-[#555] dark:text-gray-400 text-base md:text-lg leading-relaxed max-w-5xl mx-auto text-left space-y-4">
            <p>
              Currency exchange rate forecasting is a critical challenge in international finance, particularly for developing economies where exchange rate volatility has significant implications for trade, inflation, and investment. Traditional statistical models such as ARIMA and GARCH, while effective at capturing linear trends and time-varying volatility respectively, are individually insufficient to represent the full complexity of modern currency markets.
            </p>
            <p>
              Deep learning approaches such as Long Short-Term Memory (LSTM) networks address non-linear dynamics but typically neglect explicit volatility modelling. This study proposes a novel hybrid ARIMA–GARCH–LSTM forecasting framework designed to leverage the complementary strengths of all three approaches in a sequential integration strategy.
            </p>
            <p>
              Applied to daily Kenya Shilling to Canadian Dollar (KES/CAD) exchange rate data sourced from the Central Bank of Kenya, the model first uses ARIMA to capture linear mean dynamics, then applies GARCH to model volatility clustering in the residuals, and finally employs an LSTM network to learn non-linear patterns from the standardized residuals.
            </p>
            <p>
              Forecast accuracy is assessed using MAE, RMSE, and MAPE metrics, with the Diebold–Mariano test employed to determine whether performance improvements over standalone benchmark models are statistically significant. It is expected that the proposed hybrid framework will outperform each of its constituent models individually, providing a more robust and accurate tool for exchange rate prediction in the Kenyan macroeconomic context.
            </p>
          </div>
        </div>
      </section>

      {/* Team Slider Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 overflow-hidden">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="inline-flex items-center gap-2 text-sm text-[#555] dark:text-gray-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-white inline-block" />
              Our Experts
            </span>
            <h2
              className="text-[36px] sm:text-[48px] md:text-[56px] leading-[1.05] font-normal text-[#1a1a1a] dark:text-white"
              style={{
                fontFamily: "'DM Serif Display', serif",
              }}
            >
              Research Team
            </h2>
          </div>

          {/* Slider Controls */}
          <div className="flex gap-4">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-[#e0dbd5] dark:border-gray-800 flex items-center justify-center text-[#1a1a1a] dark:text-white hover:bg-[#1a1a1a] dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-[#e0dbd5] dark:border-gray-800 flex items-center justify-center text-[#1a1a1a] dark:text-white hover:bg-[#1a1a1a] dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slider Track Wrapper with Negative Margins to offset padding */}
        <div className="-mx-3 md:-mx-4">
          {/* Slider Track */}
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              transform: `translateX(-${currentIndex * (100 / teamMembers.length)}%)`,
              width: `${(teamMembers.length / 4) * 100}%`
            }}
          >
            {teamMembers.map((member, idx) => {
              return (
                <div
                  key={idx}
                  className="flex-shrink-0 px-3 md:px-4"
                  style={{ width: `${100 / teamMembers.length}%` }}
                >
                  <div className="w-full h-full group relative block overflow-hidden rounded-xl aspect-[3/4] bg-[#e8e3dd] cursor-pointer">
                {/* Background Graphics (Preserving Velisse Brand) */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20 z-10" />

                {/* Image Layer */}
                <img
                  src={member.image}
                  alt={member.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />



                {/* Name Label */}
                <div className="absolute top-5 left-5 z-20">
                  <span className="text-white text-sm md:text-base font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded">
                    {member.name}
                  </span>
                </div>

                {/* Hover Bio Reveal Overlay */}
                <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-[#f5f0eb]/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 text-[#1a1a1a] dark:text-white">
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    {member.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 text-[#555] dark:text-gray-400">
                    {member.bio}
                  </p>
                  <div className="w-8 h-1 bg-[#1a1a1a] dark:bg-white rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-300" />
                </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white border-t border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-12">
            {/* Logo + Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3
                className="text-3xl md:text-4xl font-bold text-white mb-4"
                style={{
                  fontFamily: "'DM Serif Display', serif",
                }}
              >
                QuantForecast®
              </h3>
              <p className="text-[#888] text-sm leading-relaxed max-w-xs">
                A sequential hybrid forecasting framework combining ARIMA, GARCH, and LSTM architectures to capture the complex dynamics of currency markets.
              </p>
            </div>

            {/* Contact Info */}
            <div id="contact">
              <div className="space-y-4">
                <div>
                  <span className="text-[#666] text-xs uppercase tracking-wider">
                    Institution:
                  </span>
                  <p className="text-white text-sm mt-1">
                    Multimedia University of Kenya
                  </p>
                </div>
                <div>
                  <span className="text-[#666] text-xs uppercase tracking-wider">
                    Research Area:
                  </span>
                  <p className="text-white text-sm mt-1">
                    Faculty of Science and Technology
                  </p>
                </div>
                <div>
                  <span className="text-[#666] text-xs uppercase tracking-wider">
                    Target Currency:
                  </span>
                  <p className="text-white text-sm mt-1">KES/CAD Exchange Rate</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white text-sm font-medium mb-4">
                Navigation
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/"
                    className="text-[#888] text-sm hover:text-white transition-colors duration-200"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/models"
                    className="text-[#888] text-sm hover:text-white transition-colors duration-200"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-[#888] text-sm hover:text-white transition-colors duration-200"
                  >
                    Project
                  </Link>
                </li>
                <li>
                  <Link
                    href="/system/Dashboard"
                    className="text-[#888] text-sm hover:text-white transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Project Details */}
            <div>
              <h4 className="text-white text-sm font-medium mb-4">
                Methodology
              </h4>
              <ul className="space-y-2.5">
                <li><span className="text-[#888] text-sm">Linear Modeling (ARIMA)</span></li>
                <li><span className="text-[#888] text-sm">Volatility Estimation (GARCH)</span></li>
                <li><span className="text-[#888] text-sm">Non-linear Learning (LSTM)</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#2a2a2a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#666] text-xs">
              © 2026 QuantForecast Research Group.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-[#666] text-xs">Multimedia University of Kenya</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
