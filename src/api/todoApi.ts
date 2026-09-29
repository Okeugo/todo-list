import { Todo, Priority } from '../types/todo';

const API_BASE = '/api';

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string | null;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
  due_date?: string | null;
}

export interface HealthResponse {
  status: string;
  backend: string;
  database: string;
  version: string;
}

export const todoApi = {
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getAll(): Promise<Todo[]> {
    const res = await fetch(`${API_BASE}/todos`);
    if (!res.ok) throw new Error(`Failed to load todos (${res.status})`);
    return res.json();
  },

  async create(data: CreateTodoInput): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create todo' }));
      throw new Error(err.detail || 'Failed to create todo');
    }
    return res.json();
  },

  async update(id: number, data: UpdateTodoInput): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    return res.json();
  },

  async toggle(id: number): Promise<Todo> {
    const res = await fetch(`${API_BASE}/todos/${id}/toggle`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to toggle todo');
    return res.json();
  },

  async delete(id: number): Promise<{ message: string; id: number }> {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete todo');
    return res.json();
  },

  async reorder(orderedIds: number[]): Promise<Todo[]> {
    const res = await fetch(`${API_BASE}/todos/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordered_ids: orderedIds }),
    });
    if (!res.ok) throw new Error('Failed to save order');
    return res.json();
  },

  async clearCompleted(): Promise<{ message: string; cleared_count: number }> {
    const res = await fetch(`${API_BASE}/todos/bulk/completed`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to clear completed');
    return res.json();
  },
};
