import { useState, useEffect, useMemo } from 'react';
import { format, subDays, startOfMonth, parseISO } from 'date-fns';
import { analyticsService } from '../services/api';
import { RefreshCw } from 'lucide-react';

import AnalyticsSummary from '../components/analytics/AnalyticsSummary';
import ConsistencyChart from '../components/analytics/ConsistencyChart';
import TaskExecutionChart from '../components/analytics/TaskExecutionChart';
import HabitConsistencyChart from '../components/analytics/HabitConsistencyChart';
import HabitPerformance from '../components/analytics/HabitPerformance';
import ConsistencyHeatmap from '../components/analytics/ConsistencyHeatmap';
import PlanningAccuracy from '../components/analytics/PlanningAccuracy';
import ProductivityInsights from '../components/analytics/ProductivityInsights';

const RANGE_PRESETS = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

const getPresetDates = (presetKey) => {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  switch (presetKey) {
    case '7d':
      return { start: format(subDays(today, 6), 'yyyy-MM-dd'), end: todayStr };
    case '30d':
      return { start: format(subDays(today, 29), 'yyyy-MM-dd'), end: todayStr };
    case 'month':
      return { start: format(startOfMonth(today), 'yyyy-MM-dd'), end: todayStr };
    default:
      return { start: format(subDays(today, 29), 'yyyy-MM-dd'), end: todayStr };
  }
};

const Analytics = () => {
  const [activeRange, setActiveRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [validationError, setValidationError] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Compute effective dates from active range
  const effectiveDates = useMemo(() => {
    if (activeRange === 'custom') {
      return { start: customStart, end: customEnd };
    }
    return getPresetDates(activeRange);
  }, [activeRange, customStart, customEnd]);

  const fetchAnalytics = async () => {
    const { start, end } = effectiveDates;

    // Validate
    if (!start || !end) {
      setValidationError('Please select both start and end dates.');
      return;
    }
    if (start > end) {
      setValidationError('Start date must be on or before end date.');
      return;
    }
    setValidationError(null);

    try {
      setLoading(true);
      setError(null);
      const result = await analyticsService.getAnalytics(start, end);
      setData(result);
    } catch (err) {
      console.error('Analytics fetch failed:', err);
      setError('Unable to load analytics data. Please check the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeRange !== 'custom') {
      fetchAnalytics();
    }
  }, [activeRange]);

  // For custom range, user clicks a button to apply
  const handleApplyCustom = () => {
    fetchAnalytics();
  };

  // Determine if there is any actual data
  const hasAnyData = data && (
    (data.plannedTasks != null && data.plannedTasks > 0) ||
    (data.scheduledHabits != null && data.scheduledHabits > 0)
  );

  // Weekly breakdown
  const weeklyBreakdown = data?.weeklyData?.filter(w =>
    w.overallConsistencyPercentage != null ||
    (w.totalPlannedTasks != null && w.totalPlannedTasks > 0) ||
    (w.totalScheduledHabits != null && w.totalScheduledHabits > 0)
  ) || [];

  // Monthly breakdown
  const monthlyBreakdown = data?.monthlyData?.filter(m =>
    m.overallConsistencyPercentage != null ||
    (m.totalPlannedTasks != null && m.totalPlannedTasks > 0) ||
    (m.totalScheduledHabits != null && m.totalScheduledHabits > 0)
  ) || [];

  // Previous period comparison
  const hasPreviousComparison = data?.overallConsistency != null && data?.previousOverallConsistency != null;
  const consistencyDiff = hasPreviousComparison
    ? Math.round((data.overallConsistency - data.previousOverallConsistency) * 100) / 100
    : null;

  const fmt = (val) => val != null ? Math.round(val) + '%' : '—';

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pb-20 md:pb-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Analytics</h1>
        <p className="text-sm text-muted-foreground">Understand your consistency and productivity over time.</p>
      </div>

      {/* Date Range Selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.key}
            onClick={() => setActiveRange(preset.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
              activeRange === preset.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary/50'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Inputs */}
      {activeRange === 'custom' && (
        <div className="flex flex-wrap items-end gap-3 mb-6 bg-card border border-border p-4 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply
          </button>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center p-16 text-muted-foreground">
          Loading analytics...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="max-w-2xl mx-auto mt-12 text-center space-y-4">
          <p className="text-destructive text-base">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !hasAnyData && (
        <div className="text-center py-16 space-y-3">
          <p className="text-lg font-medium text-foreground">No productivity data yet.</p>
          <p className="text-sm text-muted-foreground">Complete some tasks or habits to start seeing analytics.</p>
        </div>
      )}

      {/* Data Content */}
      {!loading && !error && hasAnyData && (
        <div className="space-y-0">
          {/* Summary Cards */}
          <AnalyticsSummary data={data} />

          {/* Previous Period Comparison */}
          {hasPreviousComparison && (
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm mb-8 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Current Period</p>
                <p className="text-2xl font-bold text-primary">{fmt(data.overallConsistency)}</p>
              </div>
              <div className="text-2xl text-muted-foreground font-light">vs</div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Previous Period</p>
                <p className="text-2xl font-bold">{fmt(data.previousOverallConsistency)}</p>
              </div>
              <div className="ml-auto">
                <span className={`text-lg font-bold ${consistencyDiff > 0 ? 'text-green-500' : consistencyDiff < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {consistencyDiff > 0 ? '+' : ''}{consistencyDiff} pp
                </span>
              </div>
            </div>
          )}
          {data?.overallConsistency != null && data?.previousOverallConsistency == null && (
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm mb-8 text-sm text-muted-foreground italic">
              Not enough historical data for comparison with the previous period.
            </div>
          )}

          {/* Consistency Over Time */}
          <ConsistencyChart dailyData={data.dailyData} />

          {/* Task Execution */}
          <TaskExecutionChart dailyData={data.dailyData} />

          {/* Habit Consistency */}
          <HabitConsistencyChart dailyData={data.dailyData} />

          {/* Planning Accuracy */}
          <PlanningAccuracy data={data} />

          {/* Habit Performance */}
          <HabitPerformance habitPerformance={data.habitPerformance} />

          {/* Consistency Heatmap */}
          <ConsistencyHeatmap
            dailyData={data.dailyData}
            startDate={effectiveDates.start}
            endDate={effectiveDates.end}
          />

          {/* Weekly Breakdown */}
          {weeklyBreakdown.length > 1 && (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
              <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">Weekly Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider text-xs">
                      <th className="pb-3 font-medium">Week</th>
                      <th className="pb-3 font-medium text-right">Consistency</th>
                      <th className="pb-3 font-medium text-right">Tasks</th>
                      <th className="pb-3 font-medium text-right">Habits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {weeklyBreakdown.map((week, i) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 font-medium">
                          {format(parseISO(week.startDate), 'MMM d')} – {format(parseISO(week.endDate), 'MMM d')}
                        </td>
                        <td className="py-3 text-right font-bold text-primary">{fmt(week.overallConsistencyPercentage)}</td>
                        <td className="py-3 text-right text-muted-foreground">{fmt(week.taskExecutionPercentage)}</td>
                        <td className="py-3 text-right text-muted-foreground">{fmt(week.habitConsistencyPercentage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Breakdown */}
          {monthlyBreakdown.length > 1 && (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
              <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">Monthly Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 text-muted-foreground uppercase tracking-wider text-xs">
                      <th className="pb-3 font-medium">Month</th>
                      <th className="pb-3 font-medium text-right">Consistency</th>
                      <th className="pb-3 font-medium text-right">Tasks</th>
                      <th className="pb-3 font-medium text-right">Habits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {monthlyBreakdown.map((month, i) => (
                      <tr key={i} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3 font-medium">
                          {format(parseISO(month.startDate), 'MMMM yyyy')}
                        </td>
                        <td className="py-3 text-right font-bold text-primary">{fmt(month.overallConsistencyPercentage)}</td>
                        <td className="py-3 text-right text-muted-foreground">{fmt(month.taskExecutionPercentage)}</td>
                        <td className="py-3 text-right text-muted-foreground">{fmt(month.habitConsistencyPercentage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Productivity Insights */}
          <ProductivityInsights data={data} />
        </div>
      )}
    </div>
  );
};

export default Analytics;
