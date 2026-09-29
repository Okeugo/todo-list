import React, { useState } from 'react';
import { X, Database, RefreshCw } from 'lucide-react';
import { Todo } from '../types/todo';

interface DatabaseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: Todo[];
  onRefresh: () => void;
}

export const DatabaseViewerModal: React.FC<DatabaseViewerModalProps> = ({
  isOpen,
  onClose,
  todos,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                  SQLite Database Inspector
                </h2>
                <span className="text-[11px] font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-300">
                  backend/todos.db
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Viewing table <code className="font-mono font-medium">todos</code> ({todos.length} rows)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title="Refresh database view"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Note for Beginners */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 px-5 py-2.5 border-b border-amber-100 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <span>💡</span>
          <span>
            <strong>Beginner Insight:</strong> Notice how each row has an <code className="font-mono">order_index</code>. When you drag items on the main screen, this column updates in SQLite so your custom order is saved forever.
          </span>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border-b border-stone-200 dark:border-stone-700">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">id</th>
                  <th className="py-2.5 px-3 font-semibold">title</th>
                  <th className="py-2.5 px-3 font-semibold">completed</th>
                  <th className="py-2.5 px-3 font-semibold">order_index</th>
                  <th className="py-2.5 px-3 font-semibold">priority</th>
                  <th className="py-2.5 px-3 font-semibold">due_date</th>
                  <th className="py-2.5 px-3 font-semibold">created_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 bg-white dark:bg-stone-900">
                {todos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400 font-sans">
                      Table is currently empty. Add a todo to see SQLite rows!
                    </td>
                  </tr>
                ) : (
                  todos.map((t) => (
                    <tr key={t.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-2 px-3 text-stone-400">{t.id}</td>
                      <td className="py-2 px-3 font-sans font-medium text-stone-800 dark:text-stone-200 max-w-[200px] truncate">
                        {t.title}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.completed
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                          }`}
                        >
                          {t.completed ? '1 (TRUE)' : '0 (FALSE)'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-indigo-600 dark:text-indigo-400 font-bold">
                        {t.order_index}
                      </td>
                      <td className="py-2 px-3 capitalize text-stone-600 dark:text-stone-300">
                        {t.priority}
                      </td>
                      <td className="py-2 px-3 text-stone-500">
                        {t.due_date || 'NULL'}
                      </td>
                      <td className="py-2 px-3 text-stone-400 text-[11px]">
                        {t.created_at ? new Date(t.created_at).toLocaleTimeString() : 'now'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <span>Engine: SQLite 3 with WAL Mode</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
