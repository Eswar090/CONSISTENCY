import React, { useState, useEffect } from 'react';
import { Lightbulb, Calendar, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { smartPlanService, aiService } from '../services/api';

const SmartPlan = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const { data } = await smartPlanService.getSmartPlan();
      setPlan(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const askAi = async () => {
    setLoadingAi(true);
    try {
      const { data } = await aiService.chat({ message: "Can you explain my smart plan and workload?" });
      setAiInsight(data.message);
    } catch (e) {
      setAiInsight("AI Assistant is currently unavailable.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!plan) return <div className="p-8 text-red-500">Failed to load Smart Plan. Please try again.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Lightbulb className="mr-3 h-8 w-8 text-primary" />
          Smart Plan
        </h1>
        <p className="text-muted-foreground mt-2">Plan according to your actual capacity.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 border border-border bg-card flex flex-col items-center justify-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase">Recent Average</span>
          <span className="text-3xl font-bold">{plan.recentAverageCompletedTasks != null ? plan.recentAverageCompletedTasks.toFixed(1) : '-'}</span>
          <span className="text-xs text-muted-foreground mt-1">tasks/day completed</span>
        </div>
        <div className="card p-6 border border-border bg-card flex flex-col items-center justify-center text-center">
          <span className="text-muted-foreground text-sm font-medium mb-2 uppercase">Today's Capacity</span>
          <span className="text-3xl font-bold text-primary">{plan.planningCapacity != null ? plan.planningCapacity : '-'}</span>
          <span className="text-xs text-muted-foreground mt-1">suggested tasks</span>
        </div>
        <div className={`card p-6 border flex flex-col items-center justify-center text-center ${plan.workloadStatus === 'HEAVY' ? 'bg-red-50/50 border-red-200' : plan.workloadStatus === 'LIGHT' ? 'bg-blue-50/50 border-blue-200' : plan.workloadStatus === 'BALANCED' ? 'bg-green-50/50 border-green-200' : 'bg-card'}`}>
          <span className="text-sm font-medium mb-2 uppercase">Workload Status</span>
          <span className="text-2xl font-bold">{plan.workloadStatus || '-'}</span>
          <span className="text-xs mt-1">{plan.plannedTaskCount || 0} tasks planned</span>
        </div>
      </div>

      {plan.warnings && plan.warnings.length > 0 && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="flex items-center text-amber-800 font-semibold mb-2">
            <AlertTriangle className="mr-2 h-5 w-5" /> Insights & Warnings
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-amber-900 text-sm">
            {plan.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="mb-8">
        <button onClick={askAi} disabled={loadingAi} className="btn btn-outline flex items-center w-full justify-center py-3">
          <Sparkles className="mr-2 h-5 w-5 text-primary" />
          {loadingAi ? "Analyzing..." : "Ask AI about this plan"}
        </button>
        
        {aiInsight && (
          <div className="mt-4 p-5 bg-card border border-border rounded-lg prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} />
          </div>
        )}
      </div>

      {plan.activeGoals && plan.activeGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Goal-Aware Planning</h2>
          <div className="grid gap-3">
            {plan.activeGoals.map(goal => (
              <div key={goal.id} className="p-4 border border-border rounded-lg bg-card flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{goal.title}</h4>
                  <p className="text-sm text-muted-foreground">{Math.round(goal.progressPercentage)}% completed</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">Needs {goal.requiredPace.toFixed(1)} {goal.unit}/day</div>
                  <div className="text-xs text-muted-foreground">{goal.daysRemaining} days left</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SmartPlan;

