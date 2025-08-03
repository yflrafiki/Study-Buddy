'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface Task {
  id: string;
  label: string;
  completed: boolean;
}

const getInitialTasks = (): Task[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = window.localStorage.getItem('progressTasks');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.warn('Error reading localStorage "progressTasks"', error);
    return [];
  }
};

export function ProgressTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mounted, setMounted] = useState(false);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskLabel, setEditingTaskLabel] = useState('');

  useEffect(() => {
    setTasks(getInitialTasks());
    // Set mounted to true after initial render to avoid hydration mismatch
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        window.localStorage.setItem('progressTasks', JSON.stringify(tasks));
      } catch (error) {
        console.warn('Error writing to localStorage "progressTasks"', error);
      }
    }
  }, [tasks, mounted]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskLabel.trim()) {
      const newTask: Task = {
        id: crypto.randomUUID(),
        label: newTaskLabel.trim(),
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskLabel('');
    }
  };
    const handleToggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

   const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };
  
  const handleStartEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskLabel(task.label);
  };

  const handleCancelEditing = () => {
    setEditingTaskId(null);
    setEditingTaskLabel('');
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTaskId && editingTaskLabel.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTaskId
            ? { ...task, label: editingTaskLabel.trim() }
            : task
        )
      );
      handleCancelEditing();
    }
  };

  const progress = useMemo(() => {
    if (!mounted || tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  }, [tasks, mounted]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
        <CardDescription>
          Keep track of your study tasks. Your list is saved in this browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="w-full h-3" />
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
           <form onSubmit={handleAddTask} className="flex gap-2">
            <Input 
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              placeholder="Add a new goal..."
              aria-label="New task input"
            />
            <Button type="submit" size="icon" aria-label="Add new task">
              <Plus />
            </Button>
          </form>
          <div className="space-y-3 pt-2">
            {tasks.length === 0 && (
              <p className="text-center text-muted-foreground">No tasks yet. Add one to get started!</p>
            )}
            {tasks.map((task) => (
             <div key={task.id} className="flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-muted group">
                 {editingTaskId === task.id ? (
                    <form onSubmit={handleUpdateTask} className="flex-grow flex items-center gap-2">
                      <Input
                        type="text"
                        value={editingTaskLabel}
                        onChange={(e) => setEditingTaskLabel(e.target.value)}
                        className="h-8"
                        autoFocus
                        onBlur={handleCancelEditing}
                      />
                      <Button type="submit" variant="secondary" size="sm">Save</Button>
                    </form>
                ) : (
                  <>
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={`Mark task '${task.label}' as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <Label
                      htmlFor={task.id}
                      className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {task.label}
                    </Label>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleStartEditing(task)} aria-label={`Edit task ${task.label}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task.id)} aria-label={`Delete task ${task.label}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
