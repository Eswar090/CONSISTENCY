import { CheckSquare, Square, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

const TaskCard = ({ task, onComplete, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div className={`card p-4 flex items-center gap-4 transition-all ${isCompleted ? 'bg-secondary/30 opacity-70' : ''}`}>
      <button 
        onClick={() => onComplete(task.id, isCompleted ? 'TODO' : 'COMPLETED')}
        className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-green-500' : 'text-muted-foreground hover:text-primary'}`}
      >
        {isCompleted ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-base truncate ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {task.title}
        </h3>
      </div>

      <div className="relative flex-shrink-0">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
            <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-md z-20 overflow-hidden">
              <button 
                onClick={() => { setShowMenu(false); onEdit(task); }}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-secondary text-foreground"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button 
                onClick={() => { setShowMenu(false); onDelete(task.id); }}
                className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
