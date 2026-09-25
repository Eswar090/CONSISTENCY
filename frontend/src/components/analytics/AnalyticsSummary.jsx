import React from 'react';

const AnalyticsSummary = ({ data }) => {
  if (!data) return null;

  const fmt = (val) => val != null ? Math.round(val) + '%' : '—';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Overall Consistency */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Overall Consistency</h3>
        <p className="text-3xl font-extrabold text-primary">
          {fmt(data.overallConsistency)}
        </p>
      </div>

      {/* Tasks Completed */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Tasks Completed</h3>
        <p className="text-3xl font-bold">
          {data.completedTasks != null ? `${data.completedTasks} / ${data.plannedTasks}` : '—'}
        </p>
        {data.taskExecutionPercentage != null && (
          <p className="text-sm font-medium text-primary mt-1">{fmt(data.taskExecutionPercentage)}</p>
        )}
      </div>

      {/* Habit Consistency */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Habit Consistency</h3>
        <p className="text-3xl font-bold">
          {fmt(data.habitConsistencyPercentage)}
        </p>
        {data.completedHabits != null && (
          <p className="text-sm font-medium text-green-500 mt-1">{data.completedHabits} / {data.scheduledHabits}</p>
        )}
      </div>

      {/* Planning Accuracy */}
      <div className="bg-card border border-border p-5 rounded-xl shadow-sm">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Planning Accuracy</h3>
        <p className="text-3xl font-bold text-primary">
          {fmt(data.taskExecutionPercentage)}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
