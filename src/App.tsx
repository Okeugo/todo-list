import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  ListTodo,
  Search,
  Database,
  BookOpen,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Todo, Priority, FilterStatus, FilterPriority } from './types/todo';
import { todoApi, HealthResponse } from './api/todoApi';
import { TodoItem } from './components/TodoItem';
import { AddTodoForm } from './components/AddTodoForm';
import { BeginnerGuideModal } from './components/BeginnerGuideModal';
import { DatabaseViewerModal } from './components/DatabaseViewerModal';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Fetch todos and health from FastAPI backend
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check health
      try {
        const healthData = await todoApi.checkHealth();
        setHealth(healthData);
      } catch (hErr) {
        console.warn('Backend connecting:', hErr);
      }

      const items = await todoApi.getAll();
      setTodos(items);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Unable to connect to FastAPI backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add Todo
  const handleAdd = async (
    title: string,
    description: string,
    priority: Priority,
    dueDate: string | null
  ) => {
    try {
      setIsSubmitting(true);
      const newTodo = await todoApi.create({
        title,
        description,
        priority,
        due_date: dueDate,
      });
      setTodos((prev) => [...prev, newTodo]);
      showToast('Task created and saved to SQLite');
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Toggle Complete
  const handleToggle = async (id: number) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const updated = await todoApi.toggle(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      showToast('Failed to update status');
      loadData(); // Revert
    }
  };

  // Handle Update Details
  const handleUpdate = async (id: number, data: Partial<Todo>) => {
    try {
      const updated = await todoApi.update(id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        due_date: data.due_date,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('Task updated in SQLite');
    } catch (err) {
      showToast('Failed to save update');
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    const prevTodos = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await todoApi.delete(id);
      showToast('Task removed from SQLite');
    } catch (err) {
      showToast('Failed to delete task');
      setTodos(prevTodos); // Revert
    }
  };

  // Handle Clear Completed
  const handleClearCompleted = async () => {
    const completedCount = todos.filter((t) => t.completed).length;
    if (completedCount === 0) return;

    try {
      await todoApi.clearCompleted();
      setTodos((prev) => prev.filter((t) => !t.completed));
      showToast(`Cleared ${completedCount} completed tasks`);
    } catch (err) {
      showToast('Failed to clear completed tasks');
    }
  };

  // Reorder Helper Function
  const saveNewOrder = async (newOrderedList: Todo[]) => {
    setTodos(newOrderedList);
    try {
      const orderedIds = newOrderedList.map((t) => t.id);
      await todoApi.reorder(orderedIds);
      showToast('Order saved to SQLite database');
    } catch (err) {
      showToast('Failed to save order to database');
      loadData();
    }
  };

  // Move Item Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...todos];
    const item = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = item;
    saveNewOrder(updated);
  };

  // Move Item Down
  const handleMoveDown = (index: number) => {
    if (index >= todos.length - 1) return;
    const updated = [...todos];
    const item = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = item;
    saveNewOrder(updated);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...todos];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    saveNewOrder(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Filtered and Searched items
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      // Status filter
      if (filterStatus === 'active' && todo.completed) return false;
      if (filterStatus === 'completed' && !todo.completed) return false;

      // Priority filter
      if (filterPriority !== 'all' && todo.priority !== filterPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = todo.title.toLowerCase().includes(query);
        const matchesDesc = (todo.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [todos, filterStatus, filterPriority, searchQuery]);

  // Statistics
  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-stone-200 dark:selection:bg-stone-800 font-sans">
      {/* Top Banner / System Bar */}
      <header className="sticky top-0 z-30 border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Stack Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-xs">
              <ListTodo className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  FastAPI Todo
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SQLite</span>
                  <span aria-hidden="true">·</span>
                  <span>FastAPI</span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                Drag or use arrows to move items · Changes persist in SQLite
              </p>
            </div>
          </div>

          {/* Action Tools for Beginner Exploration */}
          <div className="flex items-center gap-2">
            {/* Beginner Guide Button */}
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="See how React, FastAPI, and SQLite interact"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Beginner Guide</span>
            </button>

            {/* SQLite Table Inspector */}
            <button
              type="button"
              onClick={() => setIsDbViewerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 px-2.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Inspect raw SQLite database table"
            >
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Inspect DB</span>
            </button>

            {/* FastAPI Interactive Docs link */}
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-2.5 py-1.5 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
              title="Open FastAPI interactive Swagger documentation in a new tab"
            >
              <span>API Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-stone-900 text-white px-4 py-2.5 text-xs shadow-lg dark:bg-stone-100 dark:text-stone-900 transition-all">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Error Alert if any */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-4 text-xs text-rose-800 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-1 font-medium underline hover:no-underline"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* Overview Stats & Progress Card */}
        <section className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  {completedCount} of {totalCount} completed
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  ({completionPercentage}%)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeCount === 0 && totalCount > 0
                  ? 'All tasks checked off! Great job.'
                  : `${activeCount} pending task${activeCount === 1 ? '' : 's'} in SQLite`}
              </p>
            </div>

            {/* Progress Bar & Quick Clear Completed */}
            <div className="flex items-center gap-3">
              <div className="w-32 sm:w-44 h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="text-xs text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
                >
                  Clear completed
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Add Todo Form */}
        <AddTodoForm onAdd={handleAdd} isLoading={isSubmitting} />

        {/* Filter Bar, Search, and Priority Selectors */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Status Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-800/60 rounded-xl">
            {(
              [
                { id: 'all', label: 'All', count: totalCount },
                { id: 'active', label: 'Active', count: activeCount },
                { id: 'completed', label: 'Completed', count: completedCount },
              ] as const
            ).map((tab) => {
              const active = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterStatus(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[11px] opacity-60">({tab.count})</span>
                </button>
              );
            })}
          </div>

          {/* Right controls: Priority filter & Search */}
          <div className="flex items-center gap-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <span className="hidden sm:inline">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden"
              >
                <option value="all">All Priorities</option>
                <option value="high">High only</option>
                <option value="medium">Medium only</option>
                <option value="low">Low only</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 pl-8 pr-2 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden"
              />
            </div>
          </div>
        </section>

        {/* Todos List with Reordering */}
        <section className="space-y-2">
          {isLoading && todos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40">
              <RefreshCw className="w-6 h-6 animate-spin text-stone-400 mb-2" />
              <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                Loading tasks from SQLite...
              </p>
              <p className="text-xs text-stone-400 mt-1">Connecting to FastAPI on port 8000</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40">
              <ListTodo className="w-8 h-8 text-stone-300 dark:text-stone-700 mb-3" />
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                No tasks match your criteria
              </p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try clearing the search or filters to see all your saved tasks.'
                  : 'Add your first task using the box above!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTodos.map((todo, index) => (
                <div
                  key={todo.id}
                  onDrop={() => handleDrop(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                >
                  <TodoItem
                    todo={todo}
                    index={index}
                    totalCount={filteredTodos.length}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedIndex === index}
                    isDragOver={dragOverIndex === index}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer / Educational Architecture Info */}
        <footer className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Powered by Python FastAPI + SQLite3 + React</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500">Database file: <code className="font-mono">todos.db</code></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors underline-offset-2 hover:underline"
            >
              How it works
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsDbViewerOpen(true)}
              className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors underline-offset-2 hover:underline"
            >
              SQLite Inspector
            </button>
            <span aria-hidden="true">·</span>
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-700 dark:hover:text-stone-200 transition-colors underline-offset-2 hover:underline flex items-center gap-1"
            >
              Swagger Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </main>

      {/* Beginner Guide Modal */}
      <BeginnerGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* SQLite Database Inspector Modal */}
      <DatabaseViewerModal
        isOpen={isDbViewerOpen}
        onClose={() => setIsDbViewerOpen(false)}
        todos={todos}
        onRefresh={loadData}
      />
    </div>
  );
}
