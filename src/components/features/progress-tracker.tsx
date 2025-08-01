'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

const initialTasks = [
  { id: 'task1', label: 'Review Chapter 5 notes', completed: false },
  { id: 'task2', label: 'Finish Biology homework', completed: false },
  { id: 'task3', label: 'Generate flashcards for History', completed: false },
  { id: 'task4', label: 'Take practice quiz for Chemistry', completed: false },
  { id: 'task5', label: 'Plan study session for finals', completed: false },
];

export function ProgressTracker() {
  const [tasks, setTasks] = useState(initialTasks);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTask = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const progress = useMemo(() => {
    if (!mounted) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  }, [tasks, mounted]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
        <CardDescription>
          Keep track of your study tasks. This list will reset on page reload.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progress} className="w-full h-3" />
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="space-y-3 pt-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-muted">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  aria-label={`Mark task '${task.label}' as ${task.completed ? 'incomplete' : 'complete'}`}
                />
                <Label
                  htmlFor={task.id}
                  className={`flex-grow cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
