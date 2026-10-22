import React from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  PieChart,
  Repeat,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">
              Finance<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary">
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 px-3 py-2"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 mx-auto">
          <Zap className="w-3.5 h-3.5" />
          Production-Ready Full-Stack Personal Finance Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Take total control of your <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
            finances and cash flow.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
          Track expenses, set category budgets with automated overspending alerts, visualize
          trends with interactive charts, and automate recurring subscriptions safely in Indian Rupees (₹).
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn-primary text-base px-6 py-3 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            {isAuthenticated ? 'Go to Your Dashboard' : 'Create Free Account'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            to="/login"
            className="btn-secondary text-base px-6 py-3"
          >
            Explore Live Demo
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 text-left">
          <div className="card p-6 card-hover">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Category Budgets & Alerts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Define monthly limits per category. Receive instant in-app alerts when spending
              reaches 75%, 90%, or exceeds 100%.
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Repeat className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Automated Recurring Runs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Schedule subscriptions, rent, and recurring salaries with node-cron. Powered by an
              idempotent execution ledger to guarantee zero duplicates.
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">Bank-Grade Isolation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              PostgreSQL Decimal precision prevents floating-point drift. Strict user ownership
              checks protect every single read, write, and report.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 FinanceFlow Inc. Built with React, Node.js, Express, PostgreSQL, and Prisma.</p>
      </footer>
    </div>
  );
}
