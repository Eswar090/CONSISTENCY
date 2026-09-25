import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle2, Clock, Flame, Settings, X, Save } from 'lucide-react';
import { focusService } from '../services/api';

function Focus() {
  const [settings, setSettings] = useState({
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsBeforeLongBreak: 4
  });

  const getModeConfig = (s) => ({
    FOCUS: { label: 'Focus', defaultMinutes: s.focusMinutes, color: '#6366f1' },
    SHORT_BREAK: { label: 'Short Break', defaultMinutes: s.shortBreakMinutes, color: '#10b981' },
    LONG_BREAK: { label: 'Long Break', defaultMinutes: s.longBreakMinutes, color: '#3b82f6' }
  });

  const modeConfig = getModeConfig(settings);

  const [mode, setMode] = useState('FOCUS');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [dbSessionId, setDbSessionId] = useState(null);
  const [completedFocusCount, setCompletedFocusCount] = useState(0);
  
  // Timer state using timestamps
  const [isRunning, setIsRunning] = useState(false);
  const [endTimestamp, setEndTimestamp] = useState(null);
  const [remainingMs, setRemainingMs] = useState(settings.focusMinutes * 60 * 1000);
  
  // Today's statistics and history
  const [stats, setStats] = useState({ completedSessions: 0, totalFocusMinutes: 0 });
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings UI state
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  // Load initial state from backend and localStorage
  useEffect(() => {
    loadData();
    restoreTimerState();
  }, []);

  const loadData = async () => {
    try {
      const [tasks, statsData, sessions, userSettings] = await Promise.all([
        focusService.getTodayTasks(),
        focusService.getTodayStats(),
        focusService.getTodaySessions(),
        focusService.getSettings().catch(() => null) // Ignore errors if settings not yet initialized
      ]);
      setTodayTasks(tasks || []);
      setStats(statsData || { completedSessions: 0, totalFocusMinutes: 0 });
      setTodaySessions(sessions || []);
      
      if (userSettings) {
        setSettings(userSettings);
        // We do not want to overwrite a running/paused timer. 
        // We will only do this in handleReset or mode switch.
      }
    } catch (err) {
      console.error('Failed to load focus data:', err);
    } finally {
      setLoading(false);
    }
  };

  const restoreTimerState = () => {
    const saved = localStorage.getItem('focus_timer_state');
    if (!saved) return;
    try {
      const state = JSON.parse(saved);
      if (!state) return;

      setMode(state.mode || 'FOCUS');
      setSelectedTaskId(state.taskId || null);
      setDbSessionId(state.dbSessionId || null);
      setCompletedFocusCount(state.completedFocusCount || 0);

      if (state.isRunning && state.endTimestamp) {
        const left = state.endTimestamp - Date.now();
        if (left > 0) {
          setEndTimestamp(state.endTimestamp);
          setRemainingMs(left);
          setIsRunning(true);
        } else {
          // Timer expired while away
          handleTimerExpiry(state.mode, state.dbSessionId, state.completedFocusCount, state.settings || settings);
        }
      } else if (state.remainingMs) {
        setRemainingMs(state.remainingMs);
        setIsRunning(false);
      }
    } catch (e) {
      console.error('Failed to restore timer state:', e);
    }
  };

  // Save state to localStorage whenever key values change
  useEffect(() => {
    const state = {
      mode,
      taskId: selectedTaskId,
      dbSessionId,
      completedFocusCount,
      isRunning,
      endTimestamp,
      remainingMs,
      settings
    };
    localStorage.setItem('focus_timer_state', JSON.stringify(state));
  }, [mode, selectedTaskId, dbSessionId, completedFocusCount, isRunning, endTimestamp, remainingMs, settings]);

  // Main tick loop based on timestamps
  useEffect(() => {
    let interval = null;
    if (isRunning && endTimestamp) {
      interval = setInterval(() => {
        const left = endTimestamp - Date.now();
        if (left <= 0) {
          setRemainingMs(0);
          setIsRunning(false);
          clearInterval(interval);
          handleTimerExpiry(mode, dbSessionId, completedFocusCount, settings);
        } else {
          setRemainingMs(left);
        }
      }, 200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, endTimestamp, mode, dbSessionId, completedFocusCount, settings]);

  const handleTimerExpiry = async (currentMode, activeDbId, currentFocusCount, currentSettings) => {
    if (currentMode === 'FOCUS') {
      if (activeDbId) {
        try {
          await focusService.completeSession(activeDbId);
        } catch (e) {
          console.error(e);
        }
      }
      const newFocusCount = currentFocusCount + 1;
      setCompletedFocusCount(newFocusCount);

      // Refresh today's stats & session history
      loadData();

      // Determine next mode
      if (newFocusCount % currentSettings.sessionsBeforeLongBreak === 0) {
        switchMode('LONG_BREAK', currentSettings);
      } else {
        switchMode('SHORT_BREAK', currentSettings);
      }
    } else {
      // Break finished -> back to Focus mode
      switchMode('FOCUS', currentSettings);
    }
  };

  const switchMode = (newMode, currentSettings = settings) => {
    setMode(newMode);
    setIsRunning(false);
    setEndTimestamp(null);
    setDbSessionId(null);
    const ms = getModeConfig(currentSettings)[newMode].defaultMinutes * 60 * 1000;
    setRemainingMs(ms);
  };

  const handleStart = async () => {
    if (isRunning) return;

    let sessionRecordId = dbSessionId;

    // Start DB session if not already created
    if (!sessionRecordId) {
      try {
        const created = await focusService.startSession({
          taskId: mode === 'FOCUS' ? selectedTaskId : null,
          sessionType: mode,
          durationMinutes: modeConfig[mode].defaultMinutes
        });
        sessionRecordId = created.id;
        setDbSessionId(created.id);
      } catch (err) {
        console.error('Failed to record session start:', err);
      }
    }

    const end = Date.now() + remainingMs;
    setEndTimestamp(end);
    setIsRunning(true);
  };

  const handlePause = () => {
    if (!isRunning) return;
    setIsRunning(false);
    const left = Math.max(0, endTimestamp - Date.now());
    setRemainingMs(left);
    setEndTimestamp(null);
  };

  const handleResume = () => {
    if (isRunning) return;
    const end = Date.now() + remainingMs;
    setEndTimestamp(end);
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setEndTimestamp(null);
    setDbSessionId(null);
    const ms = modeConfig[mode].defaultMinutes * 60 * 1000;
    setRemainingMs(ms);
  };

  const handleSkip = async () => {
    if (dbSessionId) {
      try {
        await focusService.skipSession(dbSessionId);
      } catch (e) {
        console.error(e);
      }
    }
    handleReset();
    if (mode === 'FOCUS') {
      switchMode('SHORT_BREAK', settings);
    } else {
      switchMode('FOCUS', settings);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const updated = await focusService.updateSettings(tempSettings);
      setSettings(updated);
      setShowSettings(false);
      
      // Update timer if we aren't mid-session
      if (!isRunning && !dbSessionId && !endTimestamp) {
        setRemainingMs(getModeConfig(updated)[mode].defaultMinutes * 60 * 1000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please check your inputs.');
    } finally {
      setSavingSettings(false);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const selectedTask = todayTasks.find((t) => t.id === selectedTaskId);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 relative">
      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold">Focus Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Duration (minutes)</label>
                <input 
                  type="number" 
                  min="1" max="180" 
                  value={tempSettings.focusMinutes}
                  onChange={e => setTempSettings({...tempSettings, focusMinutes: parseInt(e.target.value) || 25})}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Break (minutes)</label>
                <input 
                  type="number" 
                  min="1" max="60" 
                  value={tempSettings.shortBreakMinutes}
                  onChange={e => setTempSettings({...tempSettings, shortBreakMinutes: parseInt(e.target.value) || 5})}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Long Break (minutes)</label>
                <input 
                  type="number" 
                  min="1" max="120" 
                  value={tempSettings.longBreakMinutes}
                  onChange={e => setTempSettings({...tempSettings, longBreakMinutes: parseInt(e.target.value) || 15})}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sessions before Long Break</label>
                <input 
                  type="number" 
                  min="1" max="10" 
                  value={tempSettings.sessionsBeforeLongBreak}
                  onChange={e => setTempSettings({...tempSettings, sessionsBeforeLongBreak: parseInt(e.target.value) || 4})}
                  className="w-full p-2 border border-border rounded-lg bg-background"
                />
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-secondary/20">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg font-medium hover:bg-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={saveSettings}
                disabled={savingSettings}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {savingSettings ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Focus Mode</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay in the zone with structured focus blocks & short breaks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium">
            <Flame className="h-4 w-4 text-amber-500" />
            <span>Session #{completedFocusCount + 1}</span>
          </div>
          <button 
            onClick={() => {
              setTempSettings(settings);
              setShowSettings(true);
            }}
            className="p-2 rounded-lg border border-border bg-card hover:bg-secondary transition-all"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex justify-center gap-2 p-1 rounded-xl bg-secondary/40 max-w-md mx-auto">
        {Object.keys(modeConfig).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            disabled={isRunning}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all ${
              mode === m
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground disabled:opacity-50'
            }`}
          >
            {modeConfig[m].label}
          </button>
        ))}
      </div>

      {/* Main Timer Display Box */}
      <div className="p-8 md:p-12 rounded-2xl border border-border bg-card text-center space-y-6 shadow-sm">
        {/* Selected Task Indicator */}
        {mode === 'FOCUS' && (
          <div className="text-sm font-medium text-muted-foreground">
            {selectedTask ? (
              <span className="text-primary font-semibold">Focusing on: {selectedTask.title}</span>
            ) : (
              <span>Select a task below to link your focus session</span>
            )}
          </div>
        )}

        {/* Large Timer Readout */}
        <div
          className="text-7xl md:text-9xl font-extrabold tracking-tight font-mono select-none"
          style={{ color: modeConfig[mode].color }}
        >
          {formatTime(remainingMs)}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center items-center gap-4 pt-4">
          {!isRunning && !endTimestamp && (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-all shadow-md"
            >
              <Play className="h-5 w-5 fill-current" />
              Start {modeConfig[mode].label}
            </button>
          )}

          {isRunning && (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold text-base hover:opacity-90 transition-all"
            >
              <Pause className="h-5 w-5 fill-current" />
              Pause
            </button>
          )}

          {!isRunning && endTimestamp !== null && remainingMs > 0 && (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:opacity-90 transition-all"
            >
              <Play className="h-5 w-5 fill-current" />
              Resume
            </button>
          )}

          {(isRunning || remainingMs < modeConfig[mode].defaultMinutes * 60 * 1000) && (
            <button
              onClick={handleReset}
              aria-label="Reset timer"
              className="p-3 rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}

          <button
            onClick={handleSkip}
            aria-label="Skip session"
            className="p-3 rounded-xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grid: Task Selector & Today's Focus Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Selector Card */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Today's Planner Tasks
          </h2>

          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks scheduled for today.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                  className={`p-3 rounded-lg border text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${
                    task.id === selectedTaskId
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-secondary/50 text-foreground'
                  }`}
                >
                  <span className="truncate">{task.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Focus Stats Card */}
        <div className="p-6 rounded-xl border border-border bg-card space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Focus Summary
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <div className="text-2xl font-bold text-primary">{stats.completedSessions}</div>
              <div className="text-xs text-muted-foreground mt-1">Sessions Completed</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <div className="text-2xl font-bold text-emerald-500">{stats.totalFocusMinutes} min</div>
              <div className="text-xs text-muted-foreground mt-1">Total Focus Time</div>
            </div>
          </div>

          {todaySessions.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Today</div>
              {todaySessions.slice(0, 4).map((s) => (
                <div key={s.id} className="text-xs flex justify-between items-center py-1 border-b border-border/50">
                  <span className="font-medium text-foreground">{s.taskTitle || s.sessionType}</span>
                  <span className="text-muted-foreground">{s.durationMinutes}m • {s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Focus;
