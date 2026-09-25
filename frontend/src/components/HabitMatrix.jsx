import { format, isBefore, startOfDay, isToday, parseISO } from 'date-fns';
import { CheckSquare, Square, Minus, Pencil, Trash2 } from 'lucide-react';

const HabitMatrix = ({ habits, weekDates, logs, stats = {}, onToggleLog, onEdit, onArchive }) => {
  const getDayName = (date) => format(date, 'EEEE').toUpperCase();

  const isScheduled = (habit, date) => {
    const dayStart = startOfDay(date);
    // Safely parse startDate whether it arrives as a string "2026-09-21" or needs parsing
    const rawStart = typeof habit.startDate === 'string' ? parseISO(habit.startDate) : new Date(habit.startDate);
    const habitStart = startOfDay(rawStart);
    
    if (isBefore(dayStart, habitStart)) {
      return false;
    }

    if (habit.frequencyType === 'DAILY') return true;
    
    if (habit.frequencyType === 'SELECTED_DAYS' && habit.selectedDays) {
      const selected = habit.selectedDays.split(',');
      return selected.includes(getDayName(date));
    }
    
    return false;
  };

  const getLogForDate = (habitId, date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return logs.find(log => log.habit.id === habitId && log.date === formattedDate);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this habit?\nHistorical completion data may also be affected.")) {
      onArchive(id);
    }
  };

  if (habits.length === 0) {
    return (
      <div className="empty-state text-center p-12 mt-8">
        <p className="text-lg font-medium mb-1">No habits yet.</p>
        <p className="text-sm opacity-80">Create your first habit to start building consistency.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col h-full">
      <div className="overflow-x-auto card p-0">
        <table className="w-full text-left border-collapse min-w-[700px] card-content">
          <thead>
            <tr className="border-b border-border bg-secondary/20">
              <th className="p-4 font-semibold text-sm w-1/4 min-w-[200px]">Habit</th>
              {weekDates.map(date => {
                const today = isToday(date);
                return (
                  <th key={date.toString()} className={`p-4 font-semibold text-center w-[9%] ${today ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`text-xs ${today ? 'font-bold' : ''}`}>{format(date, 'EEE')}</div>
                    <div className={`text-sm ${today ? 'font-bold' : ''}`}>{format(date, 'd')}</div>
                  </th>
                );
              })}
              <th className="p-4 w-20 text-center font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {habits.map(habit => {
              const habitStat = stats[habit.id];
              return (
                <tr key={habit.id} className="hover:bg-secondary/10 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {habit.icon && <span className="text-xl flex-shrink-0">{habit.icon}</span>}
                      <div>
                        <div className="font-medium text-sm text-foreground uppercase tracking-wide truncate max-w-[150px]">
                          {habit.name}
                        </div>
                        {habitStat && (
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-medium">
                            <span title="Current Streak">🔥 {habitStat.currentStreak || 0}</span>
                            <span title="Longest Streak">🏆 {habitStat.longestStreak || 0}</span>
                            {habitStat.completionRate != null && (
                              <span title="Completion Rate" className="border-l border-border/50 pl-3">
                                {Math.round(habitStat.completionRate)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  {weekDates.map(date => {
                  const scheduled = isScheduled(habit, date);
                  const log = getLogForDate(habit.id, date);
                  const isCompleted = log ? log.completed : false;
                  const dateStr = format(date, 'yyyy-MM-dd');

                  return (
                    <td key={dateStr} className="p-0 text-center">
                      {!scheduled ? (
                        <div className="flex justify-center items-center h-14 text-muted-foreground/30">
                          <Minus className="h-5 w-5" />
                        </div>
                      ) : (
                        <button 
                          onClick={() => onToggleLog(habit.id, dateStr, !isCompleted)}
                          className={`flex justify-center items-center w-full h-14 min-w-[44px] transition-colors ${
                            isCompleted ? 'text-green-500' : 'text-muted-foreground/40 hover:text-primary'
                          }`}
                        >
                          {isCompleted ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6 stroke-[1.5]" />}
                        </button>
                      )}
                    </td>
                  );
                })}

                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <button 
                      onClick={() => onEdit(habit)}
                      className="hover:text-foreground transition-colors p-1"
                      title="Edit Habit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(habit.id)}
                      className="hover:text-destructive transition-colors p-1"
                      title="Archive Habit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><CheckSquare className="h-4 w-4 text-green-500" /> = Completed</span>
        <span className="flex items-center gap-1"><Square className="h-4 w-4" /> = Not completed</span>
        <span className="flex items-center gap-1"><Minus className="h-4 w-4" /> = Not scheduled</span>
      </div>
    </div>
  );
};

export default HabitMatrix;
