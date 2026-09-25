import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, startOfWeek, addDays } from 'date-fns';

const getConsistencyLevel = (value) => {
  if (value == null) return { level: 'none', label: 'No Activity', className: 'bg-secondary/30' };
  if (value >= 90) return { level: 'excellent', label: 'Excellent', className: 'bg-green-500' };
  if (value >= 75) return { level: 'strong', label: 'Strong', className: 'bg-green-400' };
  if (value >= 50) return { level: 'moderate', label: 'Moderate', className: 'bg-yellow-400' };
  return { level: 'low', label: 'Low', className: 'bg-red-400' };
};

const ConsistencyHeatmap = ({ dailyData, startDate, endDate }) => {
  const navigate = useNavigate();

  if (!dailyData || dailyData.length === 0) return null;

  // Build a lookup map of date -> daily data
  const dataMap = {};
  dailyData.forEach(d => {
    if (d.date) dataMap[d.date] = d;
  });

  // Determine all months in range
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const today = new Date();
  const effectiveEnd = end > today ? today : end;

  // Build months
  const months = [];
  let current = startOfMonth(start);
  while (current <= effectiveEnd) {
    const monthEnd = endOfMonth(current);
    const displayEnd = monthEnd > effectiveEnd ? effectiveEnd : monthEnd;
    const displayStart = current < start ? start : current;
    
    const days = eachDayOfInterval({ start: displayStart, end: displayEnd });
    months.push({
      label: format(current, 'MMMM yyyy'),
      days,
      firstDayOffset: getDay(displayStart) === 0 ? 6 : getDay(displayStart) - 1 // Monday = 0
    });
    current = addDays(monthEnd, 1);
    current = startOfMonth(current);
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDayClick = (dateStr) => {
    navigate(`/planner?date=${dateStr}`);
  };

  const fmt = (val) => val != null ? Math.round(val) + '%' : '—';

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
      <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">Consistency Calendar</h2>
      
      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-secondary/30 border border-border/50" />
          <span>No Activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-red-400" />
          <span>Low (1–49%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-yellow-400" />
          <span>Moderate (50–74%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-green-400" />
          <span>Strong (75–89%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm bg-green-500" />
          <span>Excellent (90–100%)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        {months.map((month, mi) => (
          <div key={mi} className="mb-8 last:mb-0">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{month.label}</h3>
            <div className="grid grid-cols-7 gap-1.5 max-w-md">
              {/* Weekday headers */}
              {weekDays.map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium pb-1">{d}</div>
              ))}
              
              {/* Empty cells for offset */}
              {Array.from({ length: month.firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Day cells */}
              {month.days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const data = dataMap[dateStr];
                const consistency = data?.dailyConsistency;
                const { className, label } = getConsistencyLevel(consistency);
                
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(dateStr)}
                    title={`${format(day, 'MMM d')}\nConsistency: ${fmt(consistency)}\nTasks: ${fmt(data?.taskCompletionPercentage)}\nHabits: ${fmt(data?.habitCompletionPercentage)}`}
                    className={`w-full aspect-square rounded-sm ${className} hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer flex items-center justify-center text-[10px] font-medium text-white/80`}
                    aria-label={`${format(day, 'MMMM d')} — ${label}: ${fmt(consistency)}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConsistencyHeatmap;
