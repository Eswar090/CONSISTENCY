import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const DAYS_OF_WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

const HabitForm = ({ habit, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    frequencyType: 'DAILY',
    selectedDays: [],
    startDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        icon: habit.icon || '',
        frequencyType: habit.frequencyType || 'DAILY',
        selectedDays: habit.selectedDays ? habit.selectedDays.split(',') : [],
        startDate: habit.startDate || format(new Date(), 'yyyy-MM-dd')
      });
    }
  }, [habit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const days = [...prev.selectedDays];
      if (days.includes(day)) {
        return { ...prev, selectedDays: days.filter(d => d !== day) };
      } else {
        return { ...prev, selectedDays: [...days, day] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      ...formData,
      selectedDays: formData.frequencyType === 'SELECTED_DAYS' ? formData.selectedDays.join(',') : null
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="card-title text-lg">{habit ? 'Edit Habit' : 'Add Habit'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="card-content p-4 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Habit Name *</label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g. DSA Practice"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Icon (Emoji)</label>
              <input 
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="e.g. 📚"
                maxLength="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input 
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field w-full"
                disabled={!!habit} // Disable changing start date on edit for simplicity
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Frequency</label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="frequencyType" 
                  value="DAILY"
                  checked={formData.frequencyType === 'DAILY'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Every Day
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name="frequencyType" 
                  value="SELECTED_DAYS"
                  checked={formData.frequencyType === 'SELECTED_DAYS'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Selected Days
              </label>
            </div>

            {formData.frequencyType === 'SELECTED_DAYS' && (
              <div className="grid grid-cols-2 gap-2 pl-4">
                {DAYS_OF_WEEK.map(day => (
                  <label key={day} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.selectedDays.includes(day)}
                      onChange={() => toggleDay(day)}
                      className="accent-primary rounded"
                    />
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            )}
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
            disabled={!formData.name.trim() || (formData.frequencyType === 'SELECTED_DAYS' && formData.selectedDays.length === 0)}
            className="btn btn-primary disabled:opacity-50"
          >
            {habit ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitForm;
