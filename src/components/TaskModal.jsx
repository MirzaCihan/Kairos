import { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { generateId, getDateKey, formatTimeDisplay, isSegmentOccupied, generateTimeSlots, CATEGORIES, PRIORITIES, DAY_NAMES_SHORT } from '../utils/taskUtils';
import './TaskModal.css';

const RECURRENCE_OPTIONS = [
  { id: 'none', label: 'One Time' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekdays', label: 'Weekdays' },
  { id: 'weekends', label: 'Weekends' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom', label: 'Custom' },
];

export default function TaskModal({ isOpen, onClose, editTask, selectedDate }) {
  const { addTask, updateTask, settings } = useTaskContext();
  const nameRef = useRef(null);

  const defaultForm = {
    name: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    startTime: settings.dayStart,
    endTime: settings.dayStart + settings.granularity,
    recurrence: 'none',
    recurrenceDays: [],
  };

  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setForm({
          name: editTask.name || '',
          description: editTask.description || '',
          category: editTask.category || 'personal',
          priority: editTask.priority || 'medium',
          startTime: editTask.startTime,
          endTime: editTask.endTime,
          recurrence: editTask.recurrence || 'none',
          recurrenceDays: editTask.recurrenceDays || [],
        });
      } else {
        setForm(defaultForm);
      }
      setError('');
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, editTask]);

  const timeSlots = generateTimeSlots(0, 1440, settings.granularity);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError('Please enter a task name');
      return;
    }
    if (form.startTime >= form.endTime) {
      setError('End time must be after start time');
      return;
    }

    const taskData = {
      id: editTask?.id || generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      priority: form.priority,
      startTime: form.startTime,
      endTime: form.endTime,
      recurrence: form.recurrence,
      recurrenceDays: form.recurrence === 'custom' ? form.recurrenceDays : [],
      date: editTask?.date || getDateKey(selectedDate),
    };

    if (editTask) {
      updateTask(taskData);
    } else {
      addTask(taskData);
    }

    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
  };

  const toggleCustomDay = (day) => {
    setForm(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div className="task-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="task-modal__header">
          <h2 className="task-modal__title">{editTask ? 'Edit Task' : 'New Task'}</h2>
          <button className="task-modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="task-modal__body">
          {error && <div className="task-modal__error">{error}</div>}

          {/* Name */}
          <div className="task-modal__group">
            <label className="task-modal__label">Task Name</label>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Preparing Breakfast, Deep Work, Gym..."
            />
          </div>

          {/* Description */}
          <div className="task-modal__group">
            <label className="task-modal__label">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add details about this task..."
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Time */}
          <div className="task-modal__row">
            <div className="task-modal__group">
              <label className="task-modal__label">Start Time</label>
              <select
                value={form.startTime}
                onChange={e => {
                  const start = Number(e.target.value);
                  setForm(prev => ({
                    ...prev,
                    startTime: start,
                    endTime: Math.max(prev.endTime, start + settings.granularity)
                  }));
                }}
              >
                {timeSlots.map(slot => (
                  <option key={slot.start} value={slot.start}>
                    {formatTimeDisplay(slot.start)}
                  </option>
                ))}
              </select>
            </div>

            <div className="task-modal__group">
              <label className="task-modal__label">End Time</label>
              <select
                value={form.endTime}
                onChange={e => setForm(prev => ({ ...prev, endTime: Number(e.target.value) }))}
              >
                {timeSlots
                  .filter(slot => slot.end > form.startTime)
                  .map(slot => (
                    <option key={slot.end} value={slot.end}>
                      {formatTimeDisplay(slot.end)}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="task-modal__group">
            <label className="task-modal__label">Category</label>
            <div className="task-modal__categories">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className={`task-modal__cat-btn ${form.category === cat.id ? 'task-modal__cat-btn--selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, category: cat.id }))}
                  type="button"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="task-modal__group">
            <label className="task-modal__label">Priority</label>
            <div className="task-modal__priorities">
              {PRIORITIES.map(p => (
                <button
                  key={p.id}
                  className={`task-modal__priority-btn ${form.priority === p.id ? 'task-modal__priority-btn--selected' : ''}`}
                  style={{ color: form.priority === p.id ? p.color : undefined }}
                  onClick={() => setForm(prev => ({ ...prev, priority: p.id }))}
                  type="button"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Recurrence */}
          <div className="task-modal__group">
            <label className="task-modal__label">Repeats</label>
            <div className="task-modal__recurrence-options">
              {RECURRENCE_OPTIONS.map(r => (
                <button
                  key={r.id}
                  className={`task-modal__recurrence-btn ${form.recurrence === r.id ? 'task-modal__recurrence-btn--selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, recurrence: r.id }))}
                  type="button"
                >
                  {r.label}
                </button>
              ))}
            </div>

            {form.recurrence === 'custom' && (
              <div className="task-modal__custom-days">
                {DAY_NAMES_SHORT.map((day, i) => (
                  <button
                    key={day}
                    className={`task-modal__day-btn ${form.recurrenceDays.includes(i) ? 'task-modal__day-btn--selected' : ''}`}
                    onClick={() => toggleCustomDay(i)}
                    type="button"
                  >
                    {day[0]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="task-modal__footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>
            <span>{editTask ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
