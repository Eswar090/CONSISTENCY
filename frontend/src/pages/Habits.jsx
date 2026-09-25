import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, subWeeks, addWeeks, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { habitService, consistencyService } from '../services/api';
import HabitMatrix from '../components/HabitMatrix';
import HabitForm from '../components/HabitForm';

const Habits = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [weeklyConsistency, setWeeklyConsistency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Week calculation (starting Monday)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const weekDates = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const startDateStr = format(weekStart, 'yyyy-MM-dd');
  const endDateStr = format(weekEnd, 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, [startDateStr, endDateStr]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [habitsData, logsData, weeklyData] = await Promise.all([
        habitService.getActiveHabits(),
        habitService.getHabitLogs(startDateStr, endDateStr),
        consistencyService.getWeeklyConsistency(startDateStr)
      ]);
      setHabits(habitsData);
      setLogs(logsData);
      setWeeklyConsistency(weeklyData);

      if (habitsData.length > 0) {
        const statsPromises = habitsData.map(h => consistencyService.getHabitStats(h.id));
        const statsResponses = await Promise.all(statsPromises);
        const statsMap = {};
        statsResponses.forEach(s => { statsMap[s.habitId] = s; });
        setStats(statsMap);
      }
    } catch (err) {
      console.error('Failed to fetch habit data:', err);
      setError('Unable to load habits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => setCurrentDate(prev => subWeeks(prev, 1));
  const handleNextWeek = () => setCurrentDate(prev => addWeeks(prev, 1));
  const handleCurrentWeek = () => setCurrentDate(new Date());

  const handleToggleLog = async (habitId, dateStr, completed) => {
    try {
      // Optimistic update
      setLogs(prev => {
        const existing = prev.find(l => l.habit.id === habitId && l.date === dateStr);
        if (existing) {
          return prev.map(l => l === existing ? { ...l, completed } : l);
        } else {
          return [...prev, { habit: { id: habitId }, date: dateStr, completed }];
        }
      });
      
      await habitService.toggleHabitLog(habitId, dateStr, completed);
      // We don't strictly need to refetch if optimistic update is robust, but fetching ensures sync
    } catch (err) {
      console.error('Failed to toggle habit', err);
      fetchData(); // Revert on error
    }
  };

  const handleSaveHabit = async (habitData) => {
    try {
      if (editingHabit) {
        await habitService.updateHabit(editingHabit.id, habitData);
      } else {
        await habitService.createHabit(habitData);
      }
      setIsFormOpen(false);
      setEditingHabit(null);
      fetchData();
    } catch (err) {
      console.error('Failed to save habit', err);
      setError('Failed to save habit.');
    }
  };

  const handleArchiveHabit = async (id) => {
    try {
      await habitService.archiveHabit(id);
      fetchData();
    } catch (err) {
      console.error('Failed to archive habit', err);
    }
  };

  const openAddForm = () => {
    setEditingHabit(null);
    setIsFormOpen(true);
  };

  const openEditForm = (habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Habit Tracker</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-4">
            <button onClick={handlePreviousWeek} className="flex items-center gap-1 text-sm hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4" /> Previous Week
            </button>
            <span className="font-medium text-foreground px-2">
              {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
            </span>
            <button onClick={handleNextWeek} className="flex items-center gap-1 text-sm hover:text-foreground transition-colors">
              Next Week <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={handleCurrentWeek} className="btn ml-4 text-xs py-1 px-3">
              Today
            </button>
          </div>
        </div>

        <button 
          onClick={openAddForm}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Habit
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {loading && habits.length === 0 ? (
        <div className="flex justify-center p-12 text-muted-foreground">Loading habits...</div>
      ) : (
        <div className="flex-1 pb-8">
          <HabitMatrix 
            habits={habits}
            weekDates={weekDates}
            logs={logs}
            stats={stats}
            onToggleLog={handleToggleLog}
            onEdit={openEditForm}
            onArchive={handleArchiveHabit}
          />
          
          {habits.length > 0 && weeklyConsistency && (
            <div className="mt-8 card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="card-content p-0">
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">This Week</h3>
                <div className="flex gap-6 text-sm">
                  {weeklyConsistency.habitConsistencyPercentage != null && (
                    <span className="font-medium">
                      Habit consistency: <span className="text-primary">{Math.round(weeklyConsistency.habitConsistencyPercentage)}%</span>
                    </span>
                  )}
                  {weeklyConsistency.totalPlannedTasks > 0 && (
                    <span className="font-medium border-l border-border pl-6">
                      Task execution: <span className="text-primary">{Math.round(weeklyConsistency.taskExecutionPercentage)}%</span> 
                      <span className="text-muted-foreground font-normal ml-2">({weeklyConsistency.totalCompletedTasks}/{weeklyConsistency.totalPlannedTasks})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {habits.length === 0 && !loading && (
            <div className="text-center mt-6">
              <button 
                onClick={openAddForm}
                className="btn btn-primary inline-flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Habit
              </button>
            </div>
          )}
        </div>
      )}

      {isFormOpen && (
        <HabitForm 
          habit={editingHabit}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveHabit}
        />
      )}
    </div>
  );
};

export default Habits;
