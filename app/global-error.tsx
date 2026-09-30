'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { Database, RefreshCw, Terminal, CheckCircle2, Home } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}

export default function GlobalRootError({ error, reset }: GlobalErrorProps) {
  const [countdown, setCountdown] = useState<number>(5);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<boolean>(false);

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

  useEffect(() => {
    if (!isDbError) return;

    if (countdown <= 0) {
      handleRetry();
      setCountdown(8);
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
    <html lang="en">
      <body className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          {/* Top Gradient Header */}
          <div className="h-3 w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0 shadow-inner">
                <div className="relative">
                  <Database className="w-7 h-7 animate-pulse" />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Database Connecting
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Database is connecting, please wait a moment...
                </h1>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                The local database is initializing after a system reboot. 
                We are actively polling for availability and will refresh the page automatically once ready.
              </p>

              {/* Countdown Card */}
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

              {/* Startup Tip */}
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-700" /> One-Click Startup Script:
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
                  Run <code className="px-1.5 py-0.5 bg-amber-100 font-mono rounded font-bold text-amber-950">start-dev.bat</code> in the project directory to auto-start database services and localhost.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
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
      </body>
    </html>
  );
}
