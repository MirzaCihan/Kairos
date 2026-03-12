import { useMemo, useEffect, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { getWeekStart, getWeekDays, getTasksForDate, getDateKey, isSameDay, isToday, getCurrentTimeMinutes, formatTimeDisplay, generateTimeSlots, CATEGORIES, DAY_NAMES_SHORT } from '../utils/taskUtils';
import './WeeklyCalendarView.css';

export default function WeeklyCalendarView({ selectedDate, onEditTask, onAddTask, onDateSelect }) {
  const { settings, completions } = useTaskContext();
  const { tasks } = useTaskContext();
  const gridRef = useRef(null);

  const weekStart = getWeekStart(selectedDate);
  const weekDays = getWeekDays(weekStart);
  const timeSlots = generateTimeSlots(settings.dayStart, settings.dayEnd, settings.granularity);
  const currentTime = getCurrentTimeMinutes();

  // Scroll to current time on mount
  useEffect(() => {
    if (gridRef.current) {
      const nowOffset = ((currentTime - settings.dayStart) / settings.granularity) * 60;
      gridRef.current.scrollTop = Math.max(0, nowOffset - 200);
    }
  }, []);

  // Get tasks for each day
  const weekTasks = useMemo(() => {
    return weekDays.map(day => ({
      date: day,
      dateKey: getDateKey(day),
      tasks: getTasksForDate(tasks, day),
    }));
  }, [tasks, weekStart]);

  // Calculate task block position
  const getTaskBlockStyle = (task) => {
    const startOffset = task.startTime - settings.dayStart;
    const duration = task.endTime - task.startTime;
    const rowHeight = 60; // var(--segment-row-height)
    const top = (startOffset / settings.granularity) * rowHeight;
    const height = (duration / settings.granularity) * rowHeight;
    return { top: `${top}px`, height: `${Math.max(height - 2, 18)}px` };
  };

  // Get category color
  const getCatColor = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? cat.color : 'var(--accent-primary)';
  };

  // Current time line position
  const getNowLinePosition = () => {
    if (currentTime < settings.dayStart || currentTime > settings.dayEnd) return null;
    const offset = currentTime - settings.dayStart;
    const rowHeight = 60;
    return (offset / settings.granularity) * rowHeight;
  };

  const nowLinePos = getNowLinePosition();

  return (
    <div className="weekly-calendar">
      <div className="weekly-calendar__header">
        <h1 className="weekly-calendar__title">This Week</h1>
      </div>

      {/* Day Headers */}
      <div className="weekly-calendar__day-headers">
        <div className="weekly-calendar__time-gutter-header" />
        {weekDays.map((day, i) => {
          const today = isToday(day);
          const selected = isSameDay(day, selectedDate);
          let cl = 'weekly-calendar__day-header';
          if (today) cl += ' weekly-calendar__day-header--today';
          if (selected) cl += ' weekly-calendar__day-header--selected';
          return (
            <div key={i} className={cl} onClick={() => onDateSelect(day)} style={{ cursor: 'pointer' }}>
              <div className="weekly-calendar__day-name">{DAY_NAMES_SHORT[day.getDay()]}</div>
              <div className="weekly-calendar__day-number">{day.getDate()}</div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="weekly-calendar__grid-wrapper" ref={gridRef}>
        <div className="weekly-calendar__grid">
          {/* Time gutter */}
          <div className="weekly-calendar__time-gutter">
            {timeSlots.map((slot, i) => (
              <div key={i} className="weekly-calendar__time-slot">
                {formatTimeDisplay(slot.start)}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekTasks.map((dayData, dayIdx) => {
            const todayCol = isToday(dayData.date);
            return (
              <div key={dayIdx} className="weekly-calendar__day-column">
                {/* Time cells */}
                {timeSlots.map((slot, slotIdx) => (
                  <div
                    key={slotIdx}
                    className="weekly-calendar__cell"
                    onClick={() => {
                      onDateSelect(dayData.date);
                      onAddTask(slot.start);
                    }}
                  />
                ))}

                {/* Task blocks */}
                {dayData.tasks.map((task, taskIdx) => {
                  if (task.startTime < settings.dayStart || task.startTime >= settings.dayEnd) return null;
                  const style = getTaskBlockStyle(task);
                  const catColor = getCatColor(task.category);
                  const isComp = completions[`${task.id}_${dayData.dateKey}`];

                  return (
                    <div
                      key={`${task.id}-${taskIdx}`}
                      className={`weekly-calendar__task-block ${isComp ? 'weekly-calendar__task-block--completed' : ''}`}
                      style={{
                        ...style,
                        background: `linear-gradient(135deg, ${catColor}, color-mix(in srgb, ${catColor} 70%, black))`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTask(task);
                      }}
                      title={`${task.name}\n${formatTimeDisplay(task.startTime)} – ${formatTimeDisplay(task.endTime)}`}
                    >
                      <div className="weekly-calendar__task-block-name">{task.name}</div>
                      <div className="weekly-calendar__task-block-time">
                        {formatTimeDisplay(task.startTime)}
                      </div>
                    </div>
                  );
                })}

                {/* Now line */}
                {todayCol && nowLinePos !== null && (
                  <div
                    className="weekly-calendar__now-line"
                    style={{ top: `${nowLinePos}px` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
