import { useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { getTasksForDate, getDateKey, formatTimeDisplay, getCurrentTimeMinutes, DAY_NAMES, MONTH_NAMES, isToday } from '../utils/taskUtils';
import TaskCard from '../components/TaskCard';
import './DailyListView.css';

export default function DailyListView({ selectedDate, onEditTask, onAddTask }) {
  const { tasks, completions } = useTaskContext();

  const dateKey = getDateKey(selectedDate);
  const dayTasks = useMemo(() => getTasksForDate(tasks, selectedDate), [tasks, selectedDate]);
  const currentTime = getCurrentTimeMinutes();

  const completedCount = dayTasks.filter(t => completions[`${t.id}_${dateKey}`]).length;
  const totalCount = dayTasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Group tasks by time: upcoming vs past
  const upcomingTasks = dayTasks.filter(t => t.endTime > currentTime || !isToday(selectedDate));
  const pastTasks = isToday(selectedDate) ? dayTasks.filter(t => t.endTime <= currentTime) : [];

  // Total time planned
  const totalMinutes = dayTasks.reduce((sum, t) => sum + (t.endTime - t.startTime), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  const dateObj = new Date(selectedDate);
  const dayName = DAY_NAMES[dateObj.getDay()];
  const monthName = MONTH_NAMES[dateObj.getMonth()];

  return (
    <div className="daily-list">
      {/* Header */}
      <div className="daily-list__header">
        <h1 className="daily-list__date">
          {isToday(selectedDate) ? 'Today' : dayName}
        </h1>
        <p className="daily-list__subtitle">
          {monthName} {dateObj.getDate()}, {dateObj.getFullYear()}
          {isToday(selectedDate) && ` · ${formatTimeDisplay(currentTime)}`}
        </p>
      </div>

      {/* Stats */}
      {totalCount > 0 && (
        <>
          <div className="daily-list__stats">
            <div className="daily-list__stat">
              <span className="daily-list__stat-icon">📋</span>
              <div>
                <div className="daily-list__stat-value">{totalCount}</div>
                <div className="daily-list__stat-label">Tasks</div>
              </div>
            </div>
            <div className="daily-list__stat">
              <span className="daily-list__stat-icon">✅</span>
              <div>
                <div className="daily-list__stat-value">{completedCount}</div>
                <div className="daily-list__stat-label">Done</div>
              </div>
            </div>
            <div className="daily-list__stat">
              <span className="daily-list__stat-icon">⏱️</span>
              <div>
                <div className="daily-list__stat-value">{totalHours}h {totalMins}m</div>
                <div className="daily-list__stat-label">Planned</div>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="daily-list__progress-bar">
            <div className="daily-list__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </>
      )}

      {/* Empty State */}
      {totalCount === 0 && (
        <div className="daily-list__empty">
          <span className="daily-list__empty-icon">📝</span>
          <h3 className="daily-list__empty-title">No tasks planned</h3>
          <p className="daily-list__empty-text">
            Start organizing your day by adding time segments for tasks.
          </p>
          <button className="btn-primary daily-list__add-btn" onClick={onAddTask}>
            <span>+ Add First Task</span>
          </button>
        </div>
      )}

      {/* Current time indicator */}
      {isToday(selectedDate) && totalCount > 0 && upcomingTasks.length > 0 && pastTasks.length > 0 && (
        <div className="daily-list__now">
          <div className="daily-list__now-dot" />
          <div className="daily-list__now-line" />
          <span className="daily-list__now-time">{formatTimeDisplay(currentTime)}</span>
        </div>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <div className="daily-list__section">
          {isToday(selectedDate) && pastTasks.length > 0 && (
            <div className="daily-list__section-title">Upcoming</div>
          )}
          <div className="daily-list__tasks">
            {upcomingTasks.map((task, i) => (
              <TaskCard
                key={`${task.id}-${i}`}
                task={task}
                dateKey={dateKey}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Tasks */}
      {pastTasks.length > 0 && (
        <div className="daily-list__section">
          <div className="daily-list__section-title">Earlier</div>
          <div className="daily-list__tasks">
            {pastTasks.map((task, i) => (
              <TaskCard
                key={`${task.id}-${i}`}
                task={task}
                dateKey={dateKey}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
