import { useState, useEffect } from 'react';
import { format, startOfWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { consistencyService, habitService, focusService, goalService, smartPlanService } from '../services/api';
import { RefreshCw, Timer, Sparkles, Target, Lightbulb } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [habitStats, setHabitStats] = useState([]);
  const [focusStats, setFocusStats] = useState({ completedSessions: 0, totalFocusMinutes: 0 });
  const navigate = useNavigate();
  const [activeGoals, setActiveGoals] = useState([]);
  const [smartPlan, setSmartPlan] = useState(null);
  
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const weekStartStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
            const [daily, weekly, activeHabits, focusStatsData, goalsData, smartPlanData] = await Promise.all([
        consistencyService.getDailyConsistency(todayStr),
        consistencyService.getWeeklyConsistency(weekStartStr),
        habitService.getActiveHabits(),
        focusService.getTodayStats(),
        goalService.getGoals().catch(() => ({data: []})),
        smartPlanService.getSmartPlan().catch(() => ({data: null}))
      ]);
      
      setDailyData(daily);
      setWeeklyData(weekly);
      setFocusStats(focusStatsData || { completedSessions: 0, totalFocusMinutes: 0 });

      if (activeHabits && activeHabits.length > 0) {
        const statsPromises = activeHabits.map(h => consistencyService.getHabitStats(h.id));
        const stats = await Promise.all(statsPromises);
        
        const combinedStats = stats.map((stat, index) => ({
          ...stat,
          name: activeHabits[index].name,
          icon: activeHabits[index].icon
        }));
        
        setHabitStats(combinedStats);
      } else {
        setHabitStats([]);
      }
    } catch (err) {
      console.error('Dashboard data load failed:', err);
      setError('Unable to load consistency data. Please check the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [todayStr, weekStartStr]);

  const getStatusText = (score) => {
    if (score == null) return "Not enough data";
    if (score >= 90) return "Excellent consistency";
    if (score >= 75) return "Strong consistency";
    if (score >= 50) return "Moderate consistency";
    return "Needs improvement";
  };

  const getStatusColor = (score) => {
    if (score == null) return "text-muted-foreground";
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const fmt = (val) => val != null ? Math.round(val) + '%' : '—';

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12 text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 text-center space-y-4">
        <p className="text-destructive text-base">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  // Safe derived values
  const hasTodayTasks = dailyData?.plannedTasks != null && dailyData.plannedTasks > 0;
  const hasTodayHabits = dailyData?.scheduledHabits != null && dailyData.scheduledHabits > 0;
  const hasWeekTasks = weeklyData?.totalPlannedTasks != null && weeklyData.totalPlannedTasks > 0;
  const hasStreaks = habitStats.length > 0;
  const maxCurrent = hasStreaks ? Math.max(...habitStats.map(s => s.currentStreak || 0)) : null;
  const maxLongest = hasStreaks ? Math.max(...habitStats.map(s => s.longestStreak || 0)) : null;

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6 pb-20 md:pb-4">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* TODAY CARD */}
      <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
        <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">TODAY</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Task Progress */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Task Progress</p>
            {hasTodayTasks ? (
              <>
                <div className="text-2xl font-bold mb-1">
                  {dailyData.completedTasks} / {dailyData.plannedTasks}
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${dailyData.taskCompletionPercentage ?? 0}%` }}
                  />
                </div>
                <div className="text-sm font-semibold text-primary mt-1">{fmt(dailyData.taskCompletionPercentage)}</div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks planned</p>
            )}
          </div>

          {/* Habit Progress */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Habit Progress</p>
            {hasTodayHabits ? (
              <>
                <div className="text-2xl font-bold mb-1">
                  {dailyData.completedHabits} / {dailyData.scheduledHabits}
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${dailyData.habitCompletionPercentage ?? 0}%` }}
                  />
                </div>
                <div className="text-sm font-semibold text-green-500 mt-1">{fmt(dailyData.habitCompletionPercentage)}</div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No habits tracked</p>
            )}
          </div>

          {/* Overall Consistency */}
          <div className="md:border-l md:border-border md:pl-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Consistency</p>
            <div className="text-4xl font-extrabold text-primary">
              {fmt(dailyData?.dailyConsistency)}
            </div>
            <p className={`text-xs font-medium mt-2 ${getStatusColor(dailyData?.dailyConsistency)}`}>
              {getStatusText(dailyData?.dailyConsistency)}
            </p>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* STREAKS */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5 text-center">STREAKS</h2>
          {hasStreaks ? (
            <div className="flex flex-col gap-6 items-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <span className="text-xl">🔥</span>
                  <span className="font-medium text-sm">Current</span>
                </div>
                <span className="text-3xl font-bold">
                  {maxCurrent} <span className="text-base font-normal text-muted-foreground">days</span>
                </span>
              </div>
              <div className="text-center pt-4 border-t border-border/50 w-full">
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
                  <span className="text-xl">🏆</span>
                  <span className="font-medium text-sm">Longest</span>
                </div>
                <span className="text-3xl font-bold">
                  {maxLongest} <span className="text-base font-normal text-muted-foreground">days</span>
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">—</div>
          )}
        </div>

        {/* TODAY'S FOCUS WIDGET */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg border-b border-border pb-3 mb-4 flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              TODAY'S FOCUS
            </h2>
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Focused Time</span>
                <span className="text-2xl font-bold text-primary">{focusStats.totalFocusMinutes} min</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Completed Sessions</span>
                <span className="text-xl font-semibold">{focusStats.completedSessions}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/focus')}
            className="w-full mt-6 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Timer className="h-4 w-4" />
            Focus Now
          </button>
        </div>

        {/* PLANNING ACCURACY (WEEKLY) */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">PLANNING (This Week)</h2>
          {hasWeekTasks ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">Task Execution</span>
                <span className="text-xl font-bold text-primary">
                  {fmt(weeklyData.taskExecutionPercentage)}
                </span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${weeklyData.taskExecutionPercentage ?? 0}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/50 text-center">
                  <span className="text-muted-foreground block">Planned</span>
                  <span className="font-semibold text-base">{weeklyData.totalPlannedTasks}</span>
                </div>
                <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/50 text-center">
                  <span className="text-muted-foreground block">Completed</span>
                  <span className="font-semibold text-base">{weeklyData.totalCompletedTasks}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center py-8 text-sm text-muted-foreground">
              No tasks planned this week.
            </div>
          )}
        </div>

      </div>

      {/* AI ASSISTANT ENTRY CARD */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 p-5 rounded-xl flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-xl text-primary shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base">AI Productivity Assistant</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Ask about your productivity, trends, and habit consistency.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/ai-assistant')}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors shrink-0"
        >
          Open Assistant
        </button>
      </div>
    </div>
  );
};

export default Dashboard;


