import React, { useState } from 'react';
import { Plus, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Priority } from '../types/todo';

interface AddTodoFormProps {
  onAdd: (title: string, description: string, priority: Priority, dueDate: string | null) => Promise<void>;
  isLoading: boolean;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAdd, isLoading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    await onAdd(title.trim(), description.trim(), priority, dueDate || null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setIsExpanded(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-3 sm:p-4 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task (e.g., 'Finish reading FastAPI documentation')..."
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden"
          disabled={isLoading}
        />

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          title="More options (details, priority, due date)"
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isExpanded || description || dueDate || priority !== 'medium'
              ? 'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100'
              : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/60'
          }`}
        >
          <span>Options</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Expandable Options: Priority, Due Date, and Description */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 space-y-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Priority selection */}
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Priority:</span>
              <div className="flex items-center gap-1 p-0.5 bg-stone-100 dark:bg-stone-800 rounded-md">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-2.5 py-1 rounded text-xs capitalize font-medium transition-all ${
                        active
                          ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                          : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due date picker */}
            <div className="flex items-center gap-1.5 text-stone-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due:</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-2 py-0.5 text-xs text-stone-800 dark:text-stone-200"
              />
            </div>
          </div>

          {/* Description input */}
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-stone-400 mt-2 shrink-0" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add optional notes or descriptions for this task..."
              rows={2}
              className="flex-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-hidden focus:border-stone-400"
            />
          </div>
        </div>
      )}
    </form>
  );
};
