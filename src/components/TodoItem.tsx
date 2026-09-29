import React, { useState } from 'react';
import {
  Check,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit3,
  Calendar,
  FileText,
  Save,
  X,
} from 'lucide-react';
import { Todo, Priority } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  index: number;
  totalCount: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<Todo>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  index,
  totalCount,
  onToggle,
  onDelete,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || '');
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.due_date || '');
  const [showNotes, setShowNotes] = useState(false);

  const isCompleted = Boolean(todo.completed);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(todo.id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
      due_date: editDueDate || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditPriority(todo.priority);
    setEditDueDate(todo.due_date || '');
    setIsEditing(false);
  };

  // Priority styling following zero-pill discipline (subtle dot + quiet text)
  const priorityInfo = {
    high: { dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', label: 'High' },
    medium: { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Medium' },
    low: { dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400', label: 'Low' },
  }[todo.priority || 'medium'];

  // Check if due date is overdue
  const isOverdue =
    !isCompleted &&
    todo.due_date &&
    new Date(todo.due_date).setHours(23, 59, 59, 999) < Date.now();

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`group relative flex flex-col rounded-xl border bg-white dark:bg-stone-900 transition-all duration-150 ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-indigo-400 shadow-inner'
          : isDragOver
          ? 'border-indigo-500 border-t-2 bg-indigo-50/20 dark:bg-indigo-950/20'
          : isCompleted
          ? 'border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40 text-stone-500'
          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-sm'
      }`}
    >
      {/* Top Main Row */}
      <div className="flex items-center gap-3 p-3.5 sm:px-4">
        {/* Drag Handle & Move Controls */}
        <div className="flex items-center gap-0.5 text-stone-400 dark:text-stone-600">
          <div
            title="Drag to reorder"
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <GripVertical className="w-4 h-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300" />
          </div>

          {/* Up / Down Arrow buttons for accessible, one-tap reordering */}
          <div className="hidden sm:flex flex-col -space-y-1">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              title="Move item up"
              className="p-0.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalCount - 1}
              onClick={() => onMoveDown(index)}
              title="Move item down"
              className="p-0.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Circular Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(todo.id)}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
            isCompleted
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
              : 'border-stone-300 dark:border-stone-600 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
          }`}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
        </button>

        {/* Content or Edit Form */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3 py-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                autoFocus
                placeholder="Task title..."
                className="w-full rounded-lg border border-indigo-400 bg-white dark:bg-stone-800 px-3 py-1.5 text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Optional notes or details..."
                rows={2}
                className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-500">Priority:</span>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPriority(p)}
                      className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                        editPriority === p
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-stone-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-1.5 py-0.5 text-xs text-stone-800 dark:text-stone-200"
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-1 rounded-md bg-stone-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
                  >
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span
                  onClick={() => onToggle(todo.id)}
                  className={`cursor-pointer text-sm font-medium transition-colors select-none ${
                    isCompleted
                      ? 'line-through text-stone-400 dark:text-stone-500'
                      : 'text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              {/* Metadata row (subtle typography, unboxed, with separators) */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                {/* Priority */}
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
                  <span className={`font-medium ${priorityInfo.text}`}>{priorityInfo.label}</span>
                </div>

                {/* Due Date */}
                {todo.due_date && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`flex items-center gap-1 ${
                        isOverdue ? 'text-rose-600 dark:text-rose-400 font-medium' : ''
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      {isOverdue ? 'Overdue: ' : 'Due '}
                      {new Date(todo.due_date + 'T00:00:00').toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </>
                )}

                {/* Notes indicator toggle */}
                {todo.description && (
                  <>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className="flex items-center gap-1 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 underline-offset-2 hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      {showNotes ? 'Hide note' : 'Show note'}
                    </button>
                  </>
                )}

                {/* Order Index badge */}
                <span aria-hidden="true">·</span>
                <span className="text-[11px] text-stone-400" title="SQLite order_index column">
                  #{index + 1}
                </span>
              </div>

              {/* Expanded Notes */}
              {showNotes && todo.description && (
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/60 p-2 rounded-md border border-stone-100 dark:border-stone-800">
                  {todo.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons (Edit / Delete) */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit task"
              className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              title="Delete task"
              className="p-1.5 rounded-md text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
