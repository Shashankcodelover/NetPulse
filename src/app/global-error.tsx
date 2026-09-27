'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error Boundary caught an error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 p-4 bg-gray-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex max-w-md flex-col items-center justify-center space-y-6 rounded-2xl bg-white p-8 text-center shadow-2xl bg-gray-800"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 bg-red-900/30 text-red-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 text-slate-900">
                Something went wrong
              </h2>
              <p className="text-sm text-gray-500 text-gray-400">
                A critical error occurred. Our team has been notified.
                You can try refreshing the page or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 rounded-md bg-gray-100 p-4 text-left text-xs text-red-600 bg-white text-red-400 overflow-auto max-h-32">
                  <code>{error.message}</code>
                </div>
              )}
            </div>

            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </button>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
