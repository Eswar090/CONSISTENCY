import React from 'react';
import { format, parseISO } from 'date-fns';

const ProductivityInsights = ({ data }) => {
  if (!data) return null;

  const insights = [];
  const fmt = (val) => val != null ? Math.round(val * 100) / 100 : null;

  // Overall consistency
  if (data.overallConsistency != null) {
    insights.push(`Your overall consistency was ${fmt(data.overallConsistency)}% during this period.`);
  }

  // Task execution
  if (data.plannedTasks != null && data.plannedTasks > 0) {
    insights.push(`You planned ${data.plannedTasks} tasks and completed ${data.completedTasks}.`);
    if (data.taskExecutionPercentage != null) {
      insights.push(`Your task execution rate was ${fmt(data.taskExecutionPercentage)}%.`);
    }
  }

  // Habit consistency
  if (data.scheduledHabits != null && data.scheduledHabits > 0) {
    insights.push(`You completed ${data.completedHabits} of ${data.scheduledHabits} scheduled habit occurrences (${data.habitConsistencyPercentage != null ? fmt(data.habitConsistencyPercentage) + '%' : '—'}).`);
  }

  // Longest streak from habit performance
  if (data.habitPerformance && data.habitPerformance.length > 0) {
    const longestOverall = Math.max(...data.habitPerformance.map(h => h.longestStreak || 0));
    if (longestOverall > 0) {
      const bestHabit = data.habitPerformance.find(h => (h.longestStreak || 0) === longestOverall);
      insights.push(`Your longest habit streak is ${longestOverall} days${bestHabit ? ` (${bestHabit.name})` : ''}.`);
    }
  }

  // Best day
  if (data.dailyData && data.dailyData.length > 0) {
    const daysWithData = data.dailyData.filter(d => d.dailyConsistency != null);
    if (daysWithData.length > 0) {
      const best = daysWithData.reduce((a, b) => (b.dailyConsistency > a.dailyConsistency ? b : a));
      if (best.dailyConsistency != null) {
        insights.push(`Your best day was ${format(parseISO(best.date), 'MMMM d')} with ${Math.round(best.dailyConsistency)}% consistency.`);
      }
    }
  }

  // Previous period comparison
  if (data.overallConsistency != null && data.previousOverallConsistency != null) {
    const diff = Math.round((data.overallConsistency - data.previousOverallConsistency) * 100) / 100;
    if (diff > 0) {
      insights.push(`Consistency increased by ${Math.abs(diff)} percentage points compared with the previous period.`);
    } else if (diff < 0) {
      insights.push(`Consistency decreased by ${Math.abs(diff)} percentage points compared with the previous period.`);
    } else {
      insights.push(`Consistency remained the same as the previous period.`);
    }
  } else if (data.overallConsistency != null && data.previousOverallConsistency == null) {
    insights.push(`Not enough historical data for comparison with the previous period.`);
  }

  if (insights.length === 0) return null;

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
      <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">Productivity Insights</h2>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className="text-primary mt-0.5 shrink-0">•</span>
            <span className="text-foreground/80">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductivityInsights;
