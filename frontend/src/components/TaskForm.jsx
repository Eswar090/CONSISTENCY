import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskForm = ({ date, task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    plannedDate: date
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        plannedDate: task.plannedDate || date
      });
    } else {
      setFormData(prev => ({ ...prev, plannedDate: date }));
    }
  }, [task, date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="card-title text-lg">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="card-content p-4 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Task *</label>
            <input 
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input 
              type="date"
              name="plannedDate"
              value={formData.plannedDate}
              onChange={handleChange}
              className="input-field w-full"
            />
          </div>
        </form>

        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="btn"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
            className="btn btn-primary"
          >
            {task ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
