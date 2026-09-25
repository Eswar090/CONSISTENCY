import { useState, useEffect } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Sunrise } from 'lucide-react';
import { taskService } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const DailyPlanner = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  
  useEffect(() => {
    fetchTasks();
  }, [formattedDate]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasksByDate(formattedDate);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));
  const handleToday = () => setCurrentDate(new Date());
  const handlePlanTomorrow = () => setCurrentDate(addDays(new Date(), 1));

  const calculateProgress = () => {
    if (tasks.length === 0) return { percent: null, text: 'No tasks planned' };
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const percent = Math.round((completed / tasks.length) * 100);
    return { percent, text: `${completed} / ${tasks.length} completed` };
  };

  const progress = calculateProgress();

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
      } else {
        await taskService.createTask(taskData);
      }
      setIsFormOpen(false);
      setEditingTask(null);
      if (taskData.plannedDate === formattedDate) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const handleCompleteTask = async (id, status) => {
    try {
      // Optimistically update UI
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      await taskService.updateTaskStatus(id, status);
    } catch (error) {
      console.error('Failed to update task status', error);
      fetchTasks(); // revert on failure
    }
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header and Date Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Daily Planner</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <button onClick={handlePreviousDay} className="p-1 hover:bg-secondary rounded-full transition-colors"><ChevronLeft className="h-5 w-5" /></button>
            <div className="flex items-center gap-2 font-medium text-foreground text-lg w-40 justify-center">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              {format(currentDate, 'MMM d, yyyy')}
            </div>
            <button onClick={handleNextDay} className="p-1 hover:bg-secondary rounded-full transition-colors"><ChevronRight className="h-5 w-5" /></button>
            <button onClick={handleToday} className="text-sm px-3 py-1 bg-secondary rounded-full hover:bg-secondary/80 transition-colors ml-2">Today</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handlePlanTomorrow}
            className="btn flex items-center gap-2"
          >
            <Sunrise className="h-4 w-4" />
            Plan Tomorrow
          </button>
          <button 
            onClick={openAddForm}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 card p-5">
        <div className="flex justify-between items-end mb-2">
          <h3 className="card-title">Daily Progress</h3>
          <span className="text-sm font-medium text-muted-foreground">{progress.text}</span>
        </div>
        {progress.percent !== null && (
          <div className="card-content p-0">
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden mt-4">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="mt-2 text-right">
              <span className="text-xl font-bold text-primary">{progress.percent}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto pb-8">
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state text-center p-12 flex flex-col items-center">
            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium mb-1">No tasks planned</p>
            <button 
              onClick={openAddForm}
              className="mt-6 btn btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Task
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={handleCompleteTask}
                onDelete={handleDeleteTask}
                onEdit={openEditForm}
              />
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <TaskForm 
          date={formattedDate} 
          task={editingTask} 
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default DailyPlanner;
