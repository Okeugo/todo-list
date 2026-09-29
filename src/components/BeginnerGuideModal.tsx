import React from 'react';
import { X, Database, Terminal, Layers, ExternalLink, HelpCircle } from 'lucide-react';

interface BeginnerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeginnerGuideModal: React.FC<BeginnerGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100">
              <BookOpenIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Beginner Guide: How This App Works
              </h2>
              <p className="text-xs text-stone-500">React Frontend + Python FastAPI + SQLite Database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-sm text-stone-700 dark:text-stone-300">
          {/* Architecture Pipeline */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
              The 3-Tier Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Frontend Card */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
                <div className="flex items-center gap-2 mb-2 text-stone-900 dark:text-stone-100 font-medium text-xs">
                  <Layers className="w-4 h-4 text-sky-500" />
                  <span>1. React Frontend</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  Renders the buttons, checkboxes, and drag-and-drop handles in your browser. Whenever you take an action, it issues a <code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded text-[11px]">fetch()</code> call.
                </p>
              </div>

              {/* Backend Card */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
                <div className="flex items-center gap-2 mb-2 text-stone-900 dark:text-stone-100 font-medium text-xs">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  <span>2. FastAPI Backend</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  A high-speed Python server running in <code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded text-[11px]">backend/main.py</code>. It receives JSON requests, validates them with Pydantic, and interacts with SQLite.
                </p>
              </div>

              {/* Database Card */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
                <div className="flex items-center gap-2 mb-2 text-stone-900 dark:text-stone-100 font-medium text-xs">
                  <Database className="w-4 h-4 text-amber-500" />
                  <span>3. SQLite Database</span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                  A real relational database stored in a local file (<code className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded text-[11px]">backend/todos.db</code>). Your todos survive page refreshes and browser restarts.
                </p>
              </div>
            </div>
          </div>

          {/* How Moving / Reordering Works */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-4 bg-stone-50/30 dark:bg-stone-800/20">
            <h4 className="font-medium text-stone-900 dark:text-stone-100 text-xs mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              How moving / reordering items works behind the scenes:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
              <li>In the database table, each todo row has an <code className="text-stone-800 dark:text-stone-200 font-mono">order_index</code> column (0, 1, 2, ...).</li>
              <li>When you drag an item or click the up/down arrows, React re-orders them immediately in UI state.</li>
              <li>React sends a single request: <code className="text-stone-800 dark:text-stone-200 font-mono">POST /api/todos/reorder</code> containing the updated list of IDs in order.</li>
              <li>FastAPI updates all items in SQLite in a safe transaction: <code className="text-stone-800 dark:text-stone-200 font-mono">UPDATE todos SET order_index = ? WHERE id = ?</code>.</li>
            </ol>
          </div>

          {/* Interactive Swagger Docs Link */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-stone-100 dark:bg-stone-800">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                Want to test the backend API directly?
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                FastAPI generates interactive Swagger documentation automatically at <code className="font-mono">/docs</code>.
              </p>
            </div>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 transition-colors"
            >
              <span>Open /docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
          >
            Got it, let's explore!
          </button>
        </div>
      </div>
    </div>
  );
};

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
