import React from 'react';

const PlanningAccuracy = ({ data }) => {
  if (!data) return null;

  const fmt = (val) => val != null ? Math.round(val * 100) / 100 : null;

  const hasTaskData = data.plannedTasks != null && data.plannedTasks > 0;
  const hasHabitData = data.scheduledHabits != null && data.scheduledHabits > 0;

  if (!hasTaskData && !hasHabitData) return null;

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
      <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">Planning Accuracy</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Execution */}
        {hasTaskData && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Task Execution</h3>
            <div className="flex items-end gap-6 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Planned</p>
                <p className="text-3xl font-bold">{data.plannedTasks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-primary">{data.completedTasks}</p>
              </div>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-primary transition-all duration-700 rounded-full"
                style={{ width: `${data.taskExecutionPercentage ?? 0}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-primary">
              {data.taskExecutionPercentage != null ? `${fmt(data.taskExecutionPercentage)}%` : '—'} execution rate
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              Aggregate: {data.completedTasks} / {data.plannedTasks} = {data.taskExecutionPercentage != null ? `${fmt(data.taskExecutionPercentage)}%` : '—'}
            </p>
          </div>
        )}

        {/* Habit Execution */}
        {hasHabitData && (
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Habit Execution</h3>
            <div className="flex items-end gap-6 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-3xl font-bold">{data.scheduledHabits}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-500">{data.completedHabits}</p>
              </div>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-green-500 transition-all duration-700 rounded-full"
                style={{ width: `${data.habitConsistencyPercentage ?? 0}%` }}
              />
            </div>
            <p className="text-sm font-semibold text-green-500">
              {data.habitConsistencyPercentage != null ? `${fmt(data.habitConsistencyPercentage)}%` : '—'} consistency
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              Aggregate: {data.completedHabits} / {data.scheduledHabits} = {data.habitConsistencyPercentage != null ? `${fmt(data.habitConsistencyPercentage)}%` : '—'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningAccuracy;
