'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Database, RefreshCw, Server, AlertTriangle, ArrowRight, Home, Terminal, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: ErrorProps) {
  const [countdown, setCountdown] = useState<number>(5);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<boolean>(false);

  // Classify if error is database connectivity related
  const errorMessage = (error?.message || '').toLowerCase();
  const errorCode = (error as unknown as { code?: string })?.code || '';
  const errorName = error?.name || '';

  const isDbError =
    errorCode.startsWith('P10') ||
    errorName.includes('Prisma') ||
    errorMessage.includes("can't reach database") ||
    errorMessage.includes('database') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('etimedout') ||
    errorMessage.includes('connection refused') ||
    errorMessage.includes('prisma client') ||
    errorMessage.includes('closed the connection');

  const handleRetry = () => {
    startTransition(() => {
      reset();
    });
  };

  // Auto-retry countdown for database errors
  useEffect(() => {
    if (!isDbError) return;

    if (countdown <= 0) {
      handleRetry();
      setCountdown(8); // Reset timer for next loop if still connecting
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isDbError]);

  const copyStartupCommand = () => {
    navigator.clipboard.writeText('.\\start-dev.bat');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-800 animate-fadeIn">
        {/* Top Gradient Banner */}
        <div
          className={`h-3 w-full ${
            isDbError
              ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-rose-500 to-amber-500'
          }`}
        />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Icon & Status */}
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                isDbError
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {isDbError ? (
                <div className="relative">
                  <Database className="w-7 h-7 animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isDbError
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isDbError ? 'Database Connection Pending' : 'Application Error'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                {isDbError
                  ? 'Database is connecting, please wait a moment...'
                  : 'Something unexpected occurred'}
              </h2>
            </div>
          </div>

          {/* Description & Auto-Reconnect Timer */}
          {isDbError ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                The database server may take a few moments to boot and accept connections after a system restart. 
                The application will automatically reconnect as soon as the service is ready.
              </p>

              {/* Countdown Progress Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-sm">
                    {countdown}s
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Auto-retrying in {countdown} seconds...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Syncing connection with PostgreSQL / SQLite
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRetry}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPending ? 'animate-spin' : ''}`} />
                  {isPending ? 'Reconnecting...' : 'Retry Now'}
                </button>
              </div>

              {/* Quick Troubleshooting Tip */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-700" /> One-Click Launcher Tip:
                  </span>
                  <button
                    onClick={copyStartupCommand}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      'Copy script command'
                    )}
                  </button>
                </div>
                <p className="text-xs text-amber-800">
                  You can use <code className="px-1.5 py-0.5 bg-amber-100 font-mono rounded font-bold text-amber-950">start-dev.bat</code> to automatically start PostgreSQL services and launch localhost in one click.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                An error occurred while loading this page:
              </p>
              <div className="p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl overflow-x-auto max-h-32">
                {error.message || 'Unknown runtime error'}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              <Home className="w-4 h-4" /> Go to Marketplace Home
            </Link>

            <button
              onClick={handleRetry}
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
              {isPending ? 'Connecting...' : 'Try Reconnecting Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
