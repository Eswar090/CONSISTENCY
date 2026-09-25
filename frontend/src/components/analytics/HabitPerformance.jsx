import React from 'react';

const HabitPerformance = ({ habitPerformance }) => {
  if (!habitPerformance || habitPerformance.length === 0) return null;

  const fmt = (val) => val != null ? Math.round(val) + '%' : '—';

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
      <h2 className="font-semibold text-lg border-b border-border pb-4 mb-4">Habit Performance</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider text-xs">
              <th className="pb-3 font-medium">Habit</th>
              <th className="pb-3 font-medium text-right">Completion</th>
              <th className="pb-3 font-medium text-right">Current Streak</th>
              <th className="pb-3 font-medium text-right">Longest Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {habitPerformance.map((habit) => (
              <tr key={habit.habitId} className="hover:bg-secondary/20 transition-colors">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-secondary/30 p-2 rounded-md">{habit.icon}</span>
                    <span className="font-medium text-base">{habit.name}</span>
                  </div>
                </td>
                <td className="py-4 text-right">
                  <span className="font-bold text-base">{fmt(habit.completionRate)}</span>
                </td>
                <td className="py-4 text-right text-muted-foreground">
                  <span className="text-orange-500 mr-1">🔥</span>
                  {habit.currentStreak || 0}
                </td>
                <td className="py-4 text-right text-muted-foreground">
                  <span className="text-yellow-500 mr-1">🏆</span>
                  {habit.longestStreak || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HabitPerformance;
