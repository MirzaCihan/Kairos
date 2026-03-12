import { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { getTasksForDate, getDateKey, formatTimeDisplay, formatDuration, getCurrentTimeMinutes, generateTimeSlots, isToday, CATEGORIES, DAY_NAMES, MONTH_NAMES } from '../utils/taskUtils';
import './DayTimelineView.css';

export default function DayTimelineView({ selectedDate, onEditTask, onAddTask }) {
  const { tasks, settings, completions } = useTaskContext();

  const dateKey = getDateKey(selectedDate);
  const dayTasks = useMemo(() => getTasksForDate(tasks, selectedDate), [tasks, selectedDate]);
  const timeSlots = generateTimeSlots(settings.dayStart, settings.dayEnd, settings.granularity);
  const currentTime = getCurrentTimeMinutes();

  const dateObj = new Date(selectedDate);
  const dayName = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[dateObj.getMonth()];

  // Build timeline: merge slots with tasks
  const timelineItems = useMemo(() => {
    const items = [];
    let nowInserted = false;

    for (const slot of timeSlots) {
      // Insert "now" marker
      if (isToday(selectedDate) && !nowInserted && currentTime >= slot.start && currentTime < slot.end) {
        items.push({ type: 'now', time: currentTime });
        nowInserted = true;
      }

      const slotTasks = dayTasks.filter(t =>
        t.startTime >= slot.start && t.startTime < slot.end
      );

      if (slotTasks.length > 0) {
        items.push({
          type: 'task-slot',
          time: slot.start,
          tasks: slotTasks,
        });
      } else {
        items.push({
          type: 'empty-slot',
          time: slot.start,
          end: slot.end,
        });
      }
    }

    return items;
  }, [dayTasks, timeSlots, selectedDate, currentTime]);

  const getCatColor = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : 'var(--accent-primary)';
  };

  return (
    <div className="day-timeline">
      <div className="day-timeline__header">
        <h1 className="day-timeline__title">
          {isToday(selectedDate) ? "Today's Timeline" : `${dayName}'s Timeline`}
        </h1>
        <p className="day-timeline__subtitle">
          {monthName} {dateObj.getDate()}, {dateObj.getFullYear()}
        </p>
      </div>

      {dayTasks.length === 0 ? (
        <div className="day-timeline__empty">
          <div className="day-timeline__empty-icon">⏱️</div>
          <h3>No segments planned</h3>
          <p style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-xs)' }}>
            Add tasks to see your day visualized on the timeline.
          </p>
          <button className="btn-primary" onClick={() => onAddTask()} style={{ marginTop: 'var(--space-lg)' }}>
            <span>+ Add Task</span>
          </button>
        </div>
      ) : (
        <div className="day-timeline__container">
          <div className="day-timeline__line" />

          {timelineItems.map((item, idx) => {
            if (item.type === 'now') {
              return (
                <div key="now" className="day-timeline__now-marker">
                  <div className="day-timeline__now-pulse" />
                  <span className="day-timeline__now-text">{formatTimeDisplay(item.time)} — Now</span>
                  <div className="day-timeline__now-line" />
                </div>
              );
            }

            if (item.type === 'task-slot') {
              return (
                <div key={`slot-${idx}`} className="day-timeline__slot">
                  <div className="day-timeline__slot-time">{formatTimeDisplay(item.time)}</div>
                  <div className="day-timeline__slot-dot day-timeline__slot-dot--has-task" />

                  {item.tasks.map((task, tIdx) => {
                    const catColor = getCatColor(task.category);
                    const cat = CATEGORIES.find(c => c.id === task.category);
                    const isComp = completions[`${task.id}_${dateKey}`];
                    const durationPct = Math.min(100, ((task.endTime - task.startTime) / (settings.dayEnd - settings.dayStart)) * 100 * 3);

                    return (
                      <div
                        key={`${task.id}-${tIdx}`}
                        className={`day-timeline__task ${isComp ? 'day-timeline__task--completed' : ''}`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                        onClick={() => onEditTask(task)}
                      >
                        <div className="day-timeline__task-top">
                          <span className="day-timeline__task-name">{task.name}</span>
                          {cat && (
                            <span
                              className="day-timeline__task-badge"
                              style={{
                                background: `color-mix(in srgb, ${catColor} 15%, transparent)`,
                                color: catColor,
                              }}
                            >
                              {cat.icon} {cat.name}
                            </span>
                          )}
                        </div>

                        <div className="day-timeline__task-meta">
                          <span>{formatTimeDisplay(task.startTime)} – {formatTimeDisplay(task.endTime)}</span>
                          <span>·</span>
                          <span>{formatDuration(task.startTime, task.endTime)}</span>
                          {task._isRecurring && <span>· 🔄 Recurring</span>}
                        </div>

                        {task.description && (
                          <div className="day-timeline__task-desc">{task.description}</div>
                        )}

                        <div className="day-timeline__task-duration-bar">
                          <div
                            className="day-timeline__task-duration-fill"
                            style={{
                              width: `${durationPct}%`,
                              background: `linear-gradient(90deg, ${catColor}, color-mix(in srgb, ${catColor} 50%, transparent))`,
                            }}
                          />
                        </div>

                        <style>{`.day-timeline__task:nth-child(${tIdx + 2})::before { background: ${catColor}; }`}</style>
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Empty slot
            return (
              <div key={`empty-${idx}`} className="day-timeline__slot">
                <div className="day-timeline__slot-time">{formatTimeDisplay(item.time)}</div>
                <div className="day-timeline__slot-dot" />
                <div
                  className="day-timeline__empty-slot"
                  onClick={() => onAddTask(item.time)}
                >
                  + Add task at {formatTimeDisplay(item.time)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
