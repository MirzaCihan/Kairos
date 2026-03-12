import { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { formatTimeDisplay, formatDuration, CATEGORIES, PRIORITIES } from '../utils/taskUtils';
import './TaskCard.css';

export default function TaskCard({ task, dateKey, onEdit }) {
  const { toggleComplete, isCompleted, deleteTask } = useTaskContext();
  const [completing, setCompleting] = useState(false);

  const completed = isCompleted(task.id, dateKey);
  const category = CATEGORIES.find(c => c.id === task.category);
  const priority = PRIORITIES.find(p => p.id === task.priority);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!completed) {
      setCompleting(true);
      setTimeout(() => setCompleting(false), 400);
    }
    toggleComplete(task.id, dateKey);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (task._isRecurring) {
      if (window.confirm('This is a recurring task. Delete the entire series?')) {
        deleteTask(task.id);
      }
    } else {
      deleteTask(task.id);
    }
  };

  const catColor = category?.color || 'var(--accent-primary)';

  return (
    <div
      className={`task-card ${completed ? 'task-card--completed' : ''} ${completing ? 'task-card--completing' : ''}`}
      style={{ '--cat-color': catColor }}
      onClick={() => onEdit?.(task)}
    >
      <div className="task-card__check" style={{ borderColor: catColor }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={completed}
          onChange={handleToggle}
          aria-label={`Mark "${task.name}" as ${completed ? 'incomplete' : 'complete'}`}
        />
        <div className="task-card__check-visual" style={{ borderColor: completed ? 'transparent' : catColor }}>
          {completed ? '✓' : ''}
        </div>
      </div>

      <div className="task-card__content">
        <div className="task-card__name">{task.name}</div>
        <div className="task-card__meta">
          <span className="task-card__time">
            {formatTimeDisplay(task.startTime)} – {formatTimeDisplay(task.endTime)}
          </span>
          <span className="task-card__duration">
            {formatDuration(task.startTime, task.endTime)}
          </span>
          {task._isRecurring && (
            <span className="task-card__recurring-badge">🔄 {task.recurrence}</span>
          )}
        </div>
      </div>

      {category && (
        <span
          className="task-card__category"
          style={{
            background: `color-mix(in srgb, ${catColor} 15%, transparent)`,
            color: catColor,
          }}
        >
          {category.icon} {category.name}
        </span>
      )}

      {priority && (
        <div
          className="task-card__priority"
          style={{ background: priority.color }}
          title={`${priority.name} priority`}
        />
      )}

      <div className="task-card__actions">
        <button className="task-card__action-btn" onClick={(e) => { e.stopPropagation(); onEdit?.(task); }} title="Edit">
          ✏️
        </button>
        <button className="task-card__action-btn task-card__action-btn--delete" onClick={handleDelete} title="Delete">
          🗑️
        </button>
      </div>

    </div>
  );
}
