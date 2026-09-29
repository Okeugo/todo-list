export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: number | boolean;
  order_index: number;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type FilterStatus = 'all' | 'active' | 'completed';
export type FilterPriority = 'all' | Priority;
