import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 shadow-lg rounded-md text-sm">
        <p className="font-semibold mb-2">{format(parseISO(label), 'MMM d, yyyy')}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">{entry.value != null ? Math.round(entry.value) + '%' : '—'}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ConsistencyChart = ({ dailyData }) => {
  if (!dailyData || dailyData.length === 0) return null;

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm mb-8">
      <h2 className="font-semibold text-lg border-b border-border pb-3 mb-5">Consistency Over Time</h2>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={dailyData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickMargin={10}
              minTickGap={20}
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              name="Overall"
              dataKey="dailyConsistency" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
              connectNulls
            />
            <Line 
              type="monotone" 
              name="Tasks"
              dataKey="taskCompletionPercentage" 
              stroke="#8884d8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
            <Line 
              type="monotone" 
              name="Habits"
              dataKey="habitCompletionPercentage" 
              stroke="#10b981" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConsistencyChart;
