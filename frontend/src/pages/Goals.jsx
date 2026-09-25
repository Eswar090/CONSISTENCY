import React, { useState, useEffect } from 'react';
import { Target, Plus, CheckCircle, Clock } from 'lucide-react';
import { goalService } from '../services/api';
import { format, differenceInDays } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    title: '', description: '', goalType: 'MANUAL', 
    targetValue: 10, unit: '', 
    startDate: format(new Date(), 'yyyy-MM-dd'), 
    targetDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await goalService.getGoals();
      setGoals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await goalService.createGoal({
        ...newGoal,
        targetValue: parseFloat(newGoal.targetValue)
      });
      setShowModal(false);
      fetchGoals();
    } catch (e) {
      alert("Error creating goal");
    }
  };

  const activeGoals = goals.filter(g => g.status === 'ACTIVE');
  const completedGoals = goals.filter(g => g.status === 'COMPLETED');

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Target className="mr-3 h-8 w-8 text-primary" />
            Goals
          </h1>
          <p className="text-muted-foreground mt-2">Set targets and track your progress.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Create Goal
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <p className="text-muted-foreground">No active goals yet. Create one to get started!</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map(goal => (
              <div key={goal.id} className="card p-5 border border-border bg-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{goal.title}</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{goal.goalType}</span>
                </div>
                
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                    <span className="font-medium">{Math.round(goal.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center"><Clock className="mr-1 h-3 w-3"/> {goal.daysRemaining} days remaining</span>
                  <span>{goal.daysRemaining === 0 ? "Deadline reached" : `Deadline: ${format(new Date(goal.targetDate), 'MMM d, yyyy')}`}</span>
                </div>
                
                {goal.goalType === 'MANUAL' && (
                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={async () => {
                        await goalService.updateGoal(goal.id, { currentValue: goal.currentValue + 1 });
                        fetchGoals();
                      }}
                      className="btn btn-outline btn-sm w-full"
                    >+1 Progress</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Completed Goals</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {completedGoals.map(goal => (
              <div key={goal.id} className="card p-4 border border-border bg-muted opacity-80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">{goal.title}</h3>
                </div>
                <p className="text-sm mt-2 text-muted-foreground">Completed on: {format(new Date(goal.updatedAt), 'MMM d, yyyy')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input required type="text" className="input mt-1" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Goal Type</label>
                <select className="input mt-1" value={newGoal.goalType} onChange={e => setNewGoal({...newGoal, goalType: e.target.value})}>
                  <option value="MANUAL">Manual</option>
                  <option value="TASK_COUNT">Task Count</option>
                  <option value="HABIT_DAYS">Habit Days</option>
                  <option value="FOCUS_MINUTES">Focus Minutes</option>
                  <option value="CONSISTENCY_PERCENTAGE">Consistency %</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  {newGoal.goalType === 'MANUAL' && "You manually update progress."}
                  {newGoal.goalType === 'TASK_COUNT' && "Automatically tracks completed tasks."}
                  {newGoal.goalType === 'HABIT_DAYS' && "Automatically tracks habit completions."}
                  {newGoal.goalType === 'FOCUS_MINUTES' && "Automatically tracks focus mode minutes."}
                  {newGoal.goalType === 'CONSISTENCY_PERCENTAGE' && "Targets an average consistency %."}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Target</label>
                  <input required type="number" step="0.1" className="input mt-1" value={newGoal.targetValue} onChange={e => setNewGoal({...newGoal, targetValue: e.target.value})} />
                </div>
                <div className="w-1/3">
                  <label className="text-sm font-medium">Unit</label>
                  <input type="text" placeholder="e.g. tasks" className="input mt-1" value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium">Start Date</label>
                  <input required type="date" className="input mt-1" value={newGoal.startDate} onChange={e => setNewGoal({...newGoal, startDate: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium">Target Date</label>
                  <input required type="date" className="input mt-1" value={newGoal.targetDate} onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;

